import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const formatWorkerDate = (dateInput) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
};


const reportToCore = async (eventName, details, env) => {
  try {
    // If AXIM_TELEMETRY_URL is set in CF variables, report directly to Onyx/Core
    if (env && env.AXIM_TELEMETRY_URL) {
      await fetch(env.AXIM_TELEMETRY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.AXIM_TELEMETRY_KEY || ''}`
        },
        body: JSON.stringify({
          system: 'edge_worker',
          event: eventName,
          details
        })
      });
    }
  } catch(e) {
    console.error('Telemetry reporting failed', e);
  }
};

/**
 * Generates the legal document PDF entirely in Cloudflare's RAM.
 *
 * Utilizes pdf-lib to construct the document dynamically based on user input,
 * state statutes, and mathematical calculations. It does not write to disk,
 * strictly adhering to our Zero-Knowledge security architecture.
 *
 * @param {Object} sFormData Sanitized user input form data.
 * @param {Object} calculatedValues Pre-calculated debt totals and interest.
 * @param {Object} tone The selected tone object (formal, aggressive, etc).
 * @param {string} session_id The secure session token used for tracking.
 * @returns {Promise<Uint8Array>} The byte array of the generated PDF.
 */
const generatePdfBytes = async (sFormData, calculatedValues, tone, session_id) => {
        const pdfDoc = await PDFDocument.create();
        pdfDoc.setCreator('AXiM Document Engine');
        let currentPage = pdfDoc.addPage();
    // Use native standard fonts to completely eliminate network and memory overhead
    const customFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const { width, height } = currentPage.getSize();

        const margin = 72;
        let y = height - margin;

        const checkPageBreak = (requiredSpace) => {
          if (y - requiredSpace < margin) {
              currentPage = pdfDoc.addPage();
              y = height - margin;
          }
        };

        const wrapText = (text, maxWidth, font, size) => {
          const safeText = text.replace(/([^\s]{40})/g, '$1 ');
          const words = safeText.split(' ');
          let lines = [], currentLine = '';
          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (font.widthOfTextAtSize(testLine, size) > maxWidth && currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);
          return lines;
        };

        const drawText = (text, size = 11, font = customFont, xOffset = margin, maxWidth = width - (margin * 2), align = 'left', spacing = 1.5) => {
           if (!text) return;
           const lineHeight = size * spacing;
           text.split('\n').forEach(rawLine => {
             if (rawLine.trim() === '') { y -= lineHeight; return; }
             wrapText(rawLine, maxWidth, font, size).forEach(line => {
               checkPageBreak(lineHeight);
               let drawX = xOffset;
               if (align === 'center') {
                   const textWidth = font.widthOfTextAtSize(line, size);
                   drawX = (width - textWidth) / 2;
               }
               currentPage.drawText(line, { x: drawX, y, size, font, color: rgb(0, 0, 0) });
               y -= lineHeight;
             });
           });
        };

        // Sender Info
        drawText('FROM:', 11, boldFont, margin, width - margin * 2, 'left', 1.2);
        drawText(sFormData.creditorName, 11, customFont, margin, width - margin * 2, 'left', 1.2);
        drawText(sFormData.creditorAddress, 11, customFont, margin, width - margin * 2, 'left', 1.2);
        y -= 15;

        // Date
        const formattedDate = formatWorkerDate(sFormData.letterDate || new Date().toISOString().split('T')[0]);
        drawText(formattedDate, 11, customFont, margin, width - margin * 2, 'left', 1.2);
        y -= 15;

        // Recipient Info
        drawText('TO:', 11, boldFont, margin, width - margin * 2, 'left', 1.2);
        drawText(sFormData.debtorName, 11, customFont, margin, width - margin * 2, 'left', 1.2);
        drawText(sFormData.debtorAddress, 11, customFont, margin, width - margin * 2, 'left', 1.2);
        y -= 25;

        drawText('VIA CERTIFIED MAIL', 11, boldFont, margin, width - margin * 2, 'left', 1.2);
        drawText('CONFIDENTIAL LEGAL COMMUNICATION', 11, boldFont, margin, width - margin * 2, 'left', 1.2);
        y -= 25;

        // Title
        const titleText = tone?.title || 'FORMAL DEMAND FOR PAYMENT';
        drawText(titleText, 14, boldFont, margin, width - margin * 2, 'center', 1.5);
        y -= 15;

        drawText(`RE: NOTICE OF OVERDUE ACCOUNT (${sFormData.jurisdiction})`, 11, boldFont);
        y -= 15;

        drawText(tone?.intro || 'We are writing to inform you of an overdue balance.', 11, customFont);
        y -= 15;

        drawText('ITEMIZED DEBTS:', 11, boldFont);
        sFormData.items?.forEach(item => {
          const itemDateStr = item.date ? ` (${item.date})` : '';
          const rawAmount = String(item.amount || '0').replace(/[^0-9.-]+/g, '');
          const parsedAmount = parseFloat(rawAmount);
          const amountStr = !isNaN(parsedAmount) ? `\${parsedAmount.toFixed(2)}` : '$0.00';
          drawText(`- ${item.description || 'Service/Item'}${itemDateStr}: ${amountStr}`, 11, customFont, margin + 20);
        });
        y -= 15;

        drawText(`TOTAL DUE: ${calculatedValues?.formattedTotal}`, 11, boldFont);
        y -= 15;

        // Auto-calculate a standard 15-day deadline from the letter creation date
        const deadlineDate = new Date(sFormData.letterDate || new Date());
        deadlineDate.setUTCDate(deadlineDate.getUTCDate() + 15);
        const formattedDeadline = formatWorkerDate(deadlineDate);

        drawText(`Payment must be received by ${formattedDeadline}.`, 11, boldFont);
        if (tone?.closing) {
            drawText(tone.closing, 11, customFont);
        }
        y -= 15;

        drawText('LEGAL AUTHORITY & INTEREST CALCULATION', 11, boldFont);
        drawText(`This demand includes interest calculated at an annual rate of ${calculatedValues?.rateUsed}%.`, 11, customFont);
        y -= 25;

        drawText('Sincerely,', 11, customFont);
        y -= 40; // space for signature
        drawText('__________________________', 11, customFont);
        drawText(sFormData.creditorName, 11, customFont);

        return await pdfDoc.save();
      };

/**
 * Main Edge Router for AXiM Document Engine.
 *
 * This Cloudflare Worker handles:
 * 1. Secure proxying of Stripe Checkout sessions (avoiding frontend CORS issues).
 * 2. Zero-Knowledge PDF Generation in RAM (via pdf-lib), ensuring no PII is saved to disk.
 * 3. Secure document delivery and telemetry integration.
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsOrigin = url.origin.includes('localhost') ? url.origin : 'https://quickdemandletter.com';

    if (url.pathname.startsWith('/api/')) {
      const allowedRoutes = [
        '/api/create-checkout-session', '/api/verify-session', '/api/generate-demand-letter',
        '/api/deliver-document', '/api/send-email', '/api/webhooks/stripe', '/api/ledger/stamp',
                '/api/v1/legal-statutes', '/api/v1/telemetry/ingest', '/api/v1/telemetry/feedback', '/api/admin/telemetry-logs'
      ];

      if (!allowedRoutes.some(route => url.pathname.startsWith(route))) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin } });
      }

      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': corsOrigin, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
      }

      const subPath = url.pathname.replace(/^\/api\//, '');
      const baseUrl = env.BACKEND_URL.endsWith('/') ? env.BACKEND_URL : `${env.BACKEND_URL}/`;
      const backendUrl = new URL(subPath, baseUrl);
      backendUrl.search = url.search;
      let fetchOptions = { method: request.method, headers: new Headers(request.headers) };

      // Shared PDF Generator Helper


      if (request.method === 'POST') {
        if (url.pathname === '/api/create-checkout-session') {
          try {
            const body = await request.clone().json();
            const clientOrigin = request.headers.get('Origin') || 'https://quickdemandletter.com';
            body.success_url = body.success_url || `${clientOrigin}/success?session_id={CHECKOUT_SESSION_ID}`;
            body.cancel_url = body.cancel_url || `${clientOrigin}/start?canceled=true`;
            fetchOptions.body = JSON.stringify(body);
            fetchOptions.headers.set('Content-Type', 'application/json');
          } catch (e) { fetchOptions.body = request.clone().body; }
        } else if (url.pathname === '/api/generate-demand-letter' || url.pathname === '/api/deliver-document') {
          try {
            const body = await request.clone().json();
            const { session_id, formData, calculatedValues, tone, email } = body;

            const sanitize = (str, maxLen = 2000) => {
              const safeStr = typeof str === 'string' ? str : String(str || '');
              // Strip non-Latin characters to prevent pdf-lib encoding crashes
              return safeStr.replace(/[^\x20-\x7E\xA0-\xFF]/g, '').trim().substring(0, maxLen);
            };
            const sFormData = {
               creditorName: sanitize(formData.creditorName), creditorAddress: sanitize(formData.creditorAddress),
               debtorName: sanitize(formData.debtorName), debtorAddress: sanitize(formData.debtorAddress),
               jurisdiction: sanitize(formData.jurisdiction), dueDate: sanitize(formData.dueDate),
               letterDate: sanitize(formData.letterDate), items: Array.isArray(formData.items) ? formData.items.slice(0, 15) : []
            };

            const verifyReqUrl = new URL('/verify-session', backendUrl.origin);
            verifyReqUrl.searchParams.set('session_id', session_id);
            const verifyReq = new Request(verifyReqUrl.toString(), { method: 'GET', headers: { 'Content-Type': 'application/json' } });

            let isPaid = false;
            try {
              const verifyRes = await fetch(verifyReq, { cf: { cacheTtl: -1 } });
              const verifyData = await verifyRes.json();
              if (verifyData.isPaid || verifyData.status === 'paid' || verifyData.payment_status === 'paid') isPaid = true;
            } catch(e) { console.error('Session verification failed', e); }

            if (!isPaid) {
              return new Response(JSON.stringify({ error: 'Payment Required' }), { status: 402, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin } });
            }

            const pdfBytes = await generatePdfBytes(sFormData, calculatedValues, tone, session_id);

            if (url.pathname === '/api/deliver-document') {
              if (email) {
                const bytes = new Uint8Array(pdfBytes);
                let binary = '';
                const chunkSize = 8192;
                for (let i = 0; i < bytes.length; i += chunkSize) {
                  binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
                }
                const base64Pdf = btoa(binary);

                let emailSuccess = false;

                /**
 * The Dual-Router Delivery System.
 *
 * We employ a "Dual-Router Pattern" for document delivery to ensure 100% reliability.
 *
 * Router 1 (Primary): The EmailIt API. We use this primarily to take advantage
 * of our lifetime license and eliminate recurring delivery costs.
 *
 * Router 2 (Fail-safe): The Resend API. If EmailIt is down or unreachable,
 * the catch block automatically fails over to Resend to guarantee the user
 * receives their purchased document instantly.
 */
                // PRIMARY: EmailIt API
                try {
                  const emailItRes = await fetch('https://api.emailit.com/v2/emails', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${env.EMAILIT_API_KEY}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      from: 'AXiM Document Engine <deliveries@axim.us.com>',
                      reply_to: 'support@axim.us.com',
                      to: [email],
                      subject: 'Your Demand Letter PDF is Ready',
                      html: '<div style="font-family: monospace; max-width: 600px; margin: 0 auto; background-color: #000; color: #f4f4f5; border: 1px solid #27272a; border-radius: 8px; overflow: hidden;"><div style="background-color: #18181b; padding: 24px; text-align: center; border-bottom: 2px solid #00e5ff;"><h1 style="margin: 0; color: #00e5ff; font-size: 20px; text-transform: uppercase; letter-spacing: 2px;">AXiM Documents</h1></div><div style="padding: 32px;"><h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Your Document is Ready</h2><p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">Thank you for your purchase. Your formally structured Demand Letter has been securely generated and is attached to this email as a PDF.</p><div style="background-color: #18181b; border-left: 3px solid #f59e0b; padding: 16px; margin: 24px 0;"><p style="margin: 0; font-size: 12px; color: #fbbf24; font-weight: bold; text-transform: uppercase;">⚠️ Important Privacy Notice</p><p style="margin: 8px 0 0 0; font-size: 12px; line-height: 1.5; color: #a1a1aa;">We utilize a strict Zero-Knowledge architecture. We do not store your data. <strong>Please save the attached PDF to your local device permanently.</strong></p></div></div></div>',
                      attachments: [{ filename: 'Demand_Letter.pdf', content: base64Pdf, content_type: 'application/pdf' }]
                    })
                  });
                  if (emailItRes.ok) emailSuccess = true;
                } catch (e) { console.error('EmailIt Route Failed:', e); }

                // FALLBACK: Resend API
                if (!emailSuccess && env.RESEND_API_KEY) {
                  ctx.waitUntil(reportToCore('email_fallback_triggered', { route: '/api/deliver-document', email }, env));
                  const resendRes = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      from: 'QuickDemandLetter <deliveries@quickdemandletter.com>',
                      reply_to: 'support@quickdemandletter.com',
                      to: [email],
                      subject: 'Your Demand Letter PDF is Ready',
                      html: '<div style="font-family: monospace; max-width: 600px; margin: 0 auto; background-color: #000; color: #f4f4f5; border: 1px solid #27272a; border-radius: 8px; overflow: hidden;"><div style="background-color: #18181b; padding: 24px; text-align: center; border-bottom: 2px solid #00e5ff;"><h1 style="margin: 0; color: #00e5ff; font-size: 20px; text-transform: uppercase; letter-spacing: 2px;">QuickDemandLetter</h1></div><div style="padding: 32px;"><h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Your Document is Ready (Fallback)</h2><p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">Your formally structured Demand Letter has been securely generated and is attached to this email as a PDF.</p></div></div>',
                      attachments: [{ filename: 'Demand_Letter.pdf', content: base64Pdf }]
                    })
                  });
                  if (resendRes.ok) emailSuccess = true;
                }

                if (!emailSuccess) throw new Error("All automated delivery routes failed.");
              }
              return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin } });
            }

            return new Response(pdfBytes, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Access-Control-Allow-Origin': corsOrigin, 'Content-Disposition': 'attachment; filename="demand_letter.pdf"' } });
                    } catch(e) {
            ctx.waitUntil(reportToCore('generation_fault', { error: e.message, stack: e.stack }, env));
            return new Response(JSON.stringify({ error: 'Generation failed' }), { status: 500, headers: { 'Access-Control-Allow-Origin': corsOrigin } });
          }
        } else if (url.pathname === '/api/send-email') {
          let corsHeaders = { 'Access-Control-Allow-Origin': corsOrigin, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
          if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
          try {
            const { email, pdfData, filename } = await request.clone().json();
            if (!email || !pdfData) return new Response(JSON.stringify({ error: 'Missing payload' }), { status: 400, headers: corsHeaders });
            const safeFilename = filename || 'Demand_Letter_Final.pdf';

            let emailSuccess = false;

            // PRIMARY ROUTE: EmailIt API (axim.us.com)
            try {
              const emailItRes = await fetch('https://api.emailit.com/v2/emails', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${env.EMAILIT_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  from: 'AXiM Document Engine <deliveries@axim.us.com>',
                  reply_to: 'support@axim.us.com',
                  to: [email],
                  subject: 'Your Demand Letter PDF is Ready',
                  html: '<div style="font-family: monospace; max-width: 600px; margin: 0 auto; background-color: #000; color: #f4f4f5; border: 1px solid #27272a; border-radius: 8px; overflow: hidden;"><div style="background-color: #18181b; padding: 24px; text-align: center; border-bottom: 2px solid #00e5ff;"><h1 style="margin: 0; color: #00e5ff; font-size: 20px; text-transform: uppercase; letter-spacing: 2px;">AXiM Documents</h1></div><div style="padding: 32px;"><h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Your Document is Ready</h2><p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">Thank you for your purchase. Your formally structured Demand Letter has been securely generated and is attached to this email as a PDF.</p><div style="background-color: #18181b; border-left: 3px solid #f59e0b; padding: 16px; margin: 24px 0;"><p style="margin: 0; font-size: 12px; color: #fbbf24; font-weight: bold; text-transform: uppercase;">⚠️ Important Privacy Notice</p><p style="margin: 8px 0 0 0; font-size: 12px; line-height: 1.5; color: #a1a1aa;">We utilize a strict Zero-Knowledge architecture. We do not store your data. <strong>Please save the attached PDF to your local device permanently.</strong></p></div></div></div>',
                  attachments: [{ filename: safeFilename, content: pdfData, content_type: 'application/pdf' }]
                })
              });
              if (emailItRes.ok) emailSuccess = true;
            } catch (e) { console.error('EmailIt Route Failed:', e); }

            // FALLBACK ROUTE: Resend API
            if (!emailSuccess && env.RESEND_API_KEY) {
              ctx.waitUntil(reportToCore('email_fallback_triggered', { route: '/api/send-email', email }, env));
              const resendRes = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  from: 'QuickDemandLetter <deliveries@quickdemandletter.com>',
                  reply_to: 'support@quickdemandletter.com',
                  to: [email],
                  subject: 'Your Demand Letter PDF is Ready',
                  html: '<div style="font-family: monospace; max-width: 600px; margin: 0 auto; background-color: #000; color: #f4f4f5; border: 1px solid #27272a; border-radius: 8px; overflow: hidden;"><div style="background-color: #18181b; padding: 24px; text-align: center; border-bottom: 2px solid #00e5ff;"><h1 style="margin: 0; color: #00e5ff; font-size: 20px; text-transform: uppercase; letter-spacing: 2px;">QuickDemandLetter</h1></div><div style="padding: 32px;"><h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Your Document is Ready (Fallback Delivery)</h2><p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">Your formally structured Demand Letter has been securely generated and is attached to this email as a PDF.</p></div></div>',
                  attachments: [{ filename: safeFilename, content: pdfData }]
                })
              });
              if (resendRes.ok) emailSuccess = true;
            }

            if (!emailSuccess) throw new Error('All delivery routes failed');
            return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
          } catch (err) {
            ctx.waitUntil(reportToCore('email_delivery_failed', { error: err.message, route: '/api/send-email' }, env));
            return new Response(JSON.stringify({ error: 'Email dispatch failed' }), { status: 500, headers: corsHeaders });
          }
        } else { fetchOptions.body = request.clone().body; }
      }


      // --- EDGE DICTIONARY FALLBACK ---
      // Decentralizes the app so it doesn't rely on a central backend for statutory rates
      // --- HEALTH CHECK ---
      if (request.method === 'GET' && url.pathname === '/api/health') {
        return new Response(JSON.stringify({ status: "ok", version: "1.1.0", uptime: Math.floor(process.uptime ? process.uptime() : performance.now() / 1000) }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin }
        });
      }

      // --- HEALTH CHECK ---
      if (request.method === 'GET' && url.pathname === '/api/health') {
        return new Response(JSON.stringify({ status: "ok", version: "1.1.0", uptime: Math.floor(process.uptime ? process.uptime() : performance.now() / 1000) }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin }
        });
      }

      // --- HEALTH CHECK ---
      if (request.method === 'GET' && url.pathname === '/api/health') {
        return new Response(JSON.stringify({ status: "ok", version: "1.1.0", uptime: Math.floor(process.uptime ? process.uptime() : performance.now() / 1000) }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin }
        });
      }

      if (request.method === 'GET' && url.pathname === '/api/v1/legal-statutes') {
          const state = url.searchParams.get('state') || 'default';
          const statutes = {
              'AL': { details: { maxInterestRate: 17.5, standardInterestRate: 7.5 }, clauses: [] },
              'AK': { details: { maxInterestRate: 20.5, standardInterestRate: 10.5 }, clauses: [] },
              'AZ': { details: { maxInterestRate: 20, standardInterestRate: 10 }, clauses: [] },
              'AR': { details: { maxInterestRate: 16, standardInterestRate: 6 }, clauses: [] },
              'CA': { details: { maxInterestRate: 20, standardInterestRate: 10 }, clauses: [] },
              'CO': { details: { maxInterestRate: 18, standardInterestRate: 8 }, clauses: [] },
              'CT': { details: { maxInterestRate: 18, standardInterestRate: 8 }, clauses: [] },
              'DE': { details: { maxInterestRate: 15, standardInterestRate: 5 }, clauses: [] },
              'DC': { details: { maxInterestRate: 16, standardInterestRate: 6 }, clauses: [] },
              'FL': { details: { maxInterestRate: 14.75, standardInterestRate: 4.75 }, clauses: [] },
              'GA': { details: { maxInterestRate: 17, standardInterestRate: 7 }, clauses: [] },
              'HI': { details: { maxInterestRate: 20, standardInterestRate: 10 }, clauses: [] },
              'ID': { details: { maxInterestRate: 22, standardInterestRate: 12 }, clauses: [] },
              'IL': { details: { maxInterestRate: 15, standardInterestRate: 5 }, clauses: [] },
              'IN': { details: { maxInterestRate: 18, standardInterestRate: 8 }, clauses: [] },
              'IA': { details: { maxInterestRate: 15, standardInterestRate: 5 }, clauses: [] },
              'KS': { details: { maxInterestRate: 20, standardInterestRate: 10 }, clauses: [] },
              'KY': { details: { maxInterestRate: 16, standardInterestRate: 6 }, clauses: [] },
              'LA': { details: { maxInterestRate: 15, standardInterestRate: 5 }, clauses: [] },
              'ME': { details: { maxInterestRate: 16, standardInterestRate: 6 }, clauses: [] },
              'MD': { details: { maxInterestRate: 16, standardInterestRate: 6 }, clauses: [] },
              'MA': { details: { maxInterestRate: 22, standardInterestRate: 12 }, clauses: [] },
              'MI': { details: { maxInterestRate: 15, standardInterestRate: 5 }, clauses: [] },
              'MN': { details: { maxInterestRate: 14, standardInterestRate: 4 }, clauses: [] },
              'MS': { details: { maxInterestRate: 18, standardInterestRate: 8 }, clauses: [] },
              'MO': { details: { maxInterestRate: 19, standardInterestRate: 9 }, clauses: [] },
              'MT': { details: { maxInterestRate: 20, standardInterestRate: 10 }, clauses: [] },
              'NE': { details: { maxInterestRate: 22, standardInterestRate: 12 }, clauses: [] },
              'NV': { details: { maxInterestRate: 15.25, standardInterestRate: 5.25 }, clauses: [] },
              'NH': { details: { maxInterestRate: 15, standardInterestRate: 5 }, clauses: [] },
              'NJ': { details: { maxInterestRate: 12.5, standardInterestRate: 2.5 }, clauses: [] },
              'NM': { details: { maxInterestRate: 18.75, standardInterestRate: 8.75 }, clauses: [] },
              'NY': { details: { maxInterestRate: 19, standardInterestRate: 9 }, clauses: [] },
              'NC': { details: { maxInterestRate: 18, standardInterestRate: 8 }, clauses: [] },
              'ND': { details: { maxInterestRate: 16.5, standardInterestRate: 6.5 }, clauses: [] },
              'OH': { details: { maxInterestRate: 15, standardInterestRate: 5 }, clauses: [] },
              'OK': { details: { maxInterestRate: 16, standardInterestRate: 6 }, clauses: [] },
              'OR': { details: { maxInterestRate: 19, standardInterestRate: 9 }, clauses: [] },
              'PA': { details: { maxInterestRate: 16, standardInterestRate: 6 }, clauses: [] },
              'RI': { details: { maxInterestRate: 22, standardInterestRate: 12 }, clauses: [] },
              'SC': { details: { maxInterestRate: 17.25, standardInterestRate: 7.25 }, clauses: [] },
              'SD': { details: { maxInterestRate: 20, standardInterestRate: 10 }, clauses: [] },
              'TN': { details: { maxInterestRate: 20, standardInterestRate: 10 }, clauses: [] },
              'TX': { details: { maxInterestRate: 16, standardInterestRate: 6 }, clauses: [] },
              'UT': { details: { maxInterestRate: 20, standardInterestRate: 10 }, clauses: [] },
              'VT': { details: { maxInterestRate: 22, standardInterestRate: 12 }, clauses: [] },
              'VA': { details: { maxInterestRate: 16, standardInterestRate: 6 }, clauses: [] },
              'WA': { details: { maxInterestRate: 22, standardInterestRate: 12 }, clauses: [] },
              'WV': { details: { maxInterestRate: 17, standardInterestRate: 7 }, clauses: [] },
              'WI': { details: { maxInterestRate: 15, standardInterestRate: 5 }, clauses: [] },
              'WY': { details: { maxInterestRate: 17, standardInterestRate: 7 }, clauses: [] },
              'default': { details: { maxInterestRate: 16, standardInterestRate: 6 }, clauses: [] }
          };
          return new Response(JSON.stringify(statutes[state] || statutes['default']), {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin }
          });
      }
      // --------------------------------

            // --- TELEMETRY MOCK ---
      // Handle telemetry ingestion using KV
            // Admin telemetry logs retrieval
      if (request.method === 'GET' && url.pathname === '/api/admin/telemetry-logs') {
          const authHeader = request.headers.get('Authorization');
          if (authHeader !== env.ADMIN_SECRET) {
              return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                  status: 401,
                  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin }
              });
          }

          try {
              let systemHealth = '100% Operational';
              let checkout_exception = 0;
              let generation_fault = 0;

              if (env.TELEMETRY_KV) {
                  const listResult = await env.TELEMETRY_KV.list({ limit: 50 });
                  for (const key of listResult.keys) {
                      const val = await env.TELEMETRY_KV.get(key.name);
                      if (val) {
                          try {
                              const parsed = JSON.parse(val);
                              if (parsed.event === 'checkout_exception') checkout_exception++;
                              if (parsed.event === 'generation_fault') generation_fault++;
                          } catch (e) {
                              // ignore json parse error
                          }
                      }
                  }

                  if (checkout_exception > 0 || generation_fault > 0) {
                      systemHealth = 'Degraded';
                  }
              } else {
                  console.warn('KV not bound');
              }

              return new Response(JSON.stringify({
                  systemHealth,
                  recentFaults: { checkout_exception, generation_fault },
                  activeNodes: 4
              }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin }
              });
          } catch (e) {
              return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
                  status: 500,
                  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin }
              });
          }
      }

      if (request.method === 'POST' && url.pathname.includes('/api/v1/telemetry')) {
          try {
              const bodyText = await request.clone().text();
              if (env.TELEMETRY_KV) {
                  const key = `telemetry:${Date.now()}`;
                  await env.TELEMETRY_KV.put(key, bodyText);
              } else {
                  console.warn('KV not bound');
              }
          } catch (e) {
              console.error('Failed to parse or store telemetry', e);
          }
          return new Response(JSON.stringify({ success: true }), {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin }
          });
      }

      let fetchConfig = {};
      if (request.method === 'GET' && url.pathname.includes('legal-statutes')) {
        fetchConfig = { cf: { cacheTtl: 3600, cacheEverything: true } };
      }

      try {
        const response = await fetch(new Request(backendUrl.toString(), fetchOptions), fetchConfig);
        const newResponse = new Response(response.body, response);
        newResponse.headers.set('Access-Control-Allow-Origin', corsOrigin);
        return newResponse;
      } catch (err) { ctx.waitUntil(reportToCore('edge_timeout', { error: err.message, route: url.pathname }, env)); return new Response(JSON.stringify({ error: 'Proxy error' }), { status: 502, headers: { 'Access-Control-Allow-Origin': corsOrigin } }); }
    }

    let assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status === 404 && request.method === 'GET' && !url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i)) {
      assetResponse = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));
    }
    if (assetResponse.headers.get('content-type')?.includes('text/html')) {
      assetResponse = new Response(assetResponse.body, assetResponse);
      assetResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      assetResponse.headers.set('X-Content-Type-Options', 'nosniff');
      assetResponse.headers.set('X-Frame-Options', 'DENY');
      assetResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    } else {
      assetResponse = new Response(assetResponse.body, assetResponse);
      assetResponse.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    }
    return assetResponse;
  }
};
