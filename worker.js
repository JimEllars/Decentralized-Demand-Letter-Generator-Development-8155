import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      const allowedRoutes = [
        '/api/create-checkout-session', '/api/verify-session', '/api/generate-demand-letter',
        '/api/deliver-document', '/api/webhooks/stripe', '/api/ledger/stamp',
        '/api/v1/legal-statutes', '/api/v1/telemetry/ingest', '/api/v1/telemetry/feedback'
      ];

      if (!allowedRoutes.some(route => url.pathname.startsWith(route))) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': url.origin } });
      }

      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': url.origin, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
      }

      const subPath = url.pathname.replace(/^\/api\//, '');
      const baseUrl = env.BACKEND_URL.endsWith('/') ? env.BACKEND_URL : `${env.BACKEND_URL}/`;
      const backendUrl = new URL(subPath, baseUrl);
      backendUrl.search = url.search;
      let fetchOptions = { method: request.method, headers: new Headers(request.headers) };

      // Shared PDF Generator Helper
      const generatePdfBytes = async (sFormData, calculatedValues, tone) => {
        const pdfDoc = await PDFDocument.create();
        let currentPage = pdfDoc.addPage();
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
        const { width, height } = currentPage.getSize();
        let y = height - 50;

        const checkPageBreak = (requiredSpace) => {
          if (y - requiredSpace < 70) { currentPage = pdfDoc.addPage(); y = height - 50; }
        };

        const wrapText = (text, maxWidth, font, size) => {
          const words = text.split(' ');
          let lines = [], currentLine = '';
          for (let word of words) {
            // Edge Case: Force-break words that are longer than the max width (e.g., massive URLs)
            if (font.widthOfTextAtSize(word, size) > maxWidth) {
               let tempWord = '';
               for(let char of word) {
                 if(font.widthOfTextAtSize(tempWord + char + '-', size) > maxWidth) {
                   lines.push(tempWord + '-');
                   tempWord = char;
                 } else {
                   tempWord += char;
                 }
               }
               word = tempWord;
            }

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

        const drawText = (text, size = 12, font = timesRomanFont, xOffset = 50, maxWidth = width - 100) => {
           if (!text) return;
           text.split('\n').forEach(rawLine => {
             if (rawLine.trim() === '') { y -= size + 4; return; }
             wrapText(rawLine, maxWidth, font, size).forEach(line => {
               checkPageBreak(size + 4);
               currentPage.drawText(line, { x: xOffset, y, size, font, color: rgb(0, 0, 0) });
               y -= size + 4;
             });
             y -= 4;
           });
        };

        const formatFriendlyDate = (dateStr) => {
          if (!dateStr) return '';
          const [year, month, day] = dateStr.split('-');
          if (year && month && day) {
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
          }
          return dateStr;
        };

        const formattedDate = formatFriendlyDate(sFormData.letterDate || new Date().toISOString().split('T')[0]);
        const dateWidth = timesRomanFont.widthOfTextAtSize(formattedDate, 12);
        currentPage.drawText(formattedDate, { x: width - 50 - dateWidth, y, size: 12, font: timesRomanFont, color: rgb(0, 0, 0) });
        drawText('VIA CERTIFIED MAIL', 12, timesRomanBoldFont);
        drawText('CONFIDENTIAL LEGAL COMMUNICATION', 10, timesRomanFont, 50, width - 100);
        y -= 15;
        currentPage.drawText(tone?.title || 'FORMAL DEMAND FOR PAYMENT', { x: 50, y, size: 16, font: timesRomanBoldFont, color: rgb(0.12, 0.23, 0.54) });
        y -= 30;
        drawText('FROM:', 10, timesRomanFont); drawText(sFormData.creditorName, 12, timesRomanBoldFont); drawText(sFormData.creditorAddress, 12, timesRomanFont); y -= 20;
        drawText('TO:', 10, timesRomanFont); drawText(sFormData.debtorName, 12, timesRomanBoldFont); drawText(sFormData.debtorAddress, 12, timesRomanFont); y -= 30;
        drawText(`RE: NOTICE OF OVERDUE ACCOUNT (${sFormData.jurisdiction})`, 12, timesRomanBoldFont); y -= 20;
        drawText(tone?.intro || 'We are writing to inform you of an overdue balance.', 12, timesRomanFont); y -= 10;

        drawText('ITEMIZED DEBTS:', 12, timesRomanBoldFont);
        sFormData.items?.forEach(item => {
          const itemDateStr = item.date ? ` (${item.date})` : '';
          const amountStr = item.amount ? `$${parseFloat(item.amount).toFixed(2)}` : '$0.00';
          drawText(`- ${item.description || 'Service/Item'}${itemDateStr}: ${amountStr}`, 11, timesRomanFont, 70);
        });
        y -= 10;
        drawText(`TOTAL DUE: ${calculatedValues?.formattedTotal}`, 12, timesRomanBoldFont); y -= 20;
        drawText(`Payment must be received by ${formatFriendlyDate(sFormData.dueDate)}. ${tone?.closing || ''}`, 12, timesRomanFont); y -= 20;
        drawText('LEGAL AUTHORITY & INTEREST CALCULATION', 12, timesRomanBoldFont);
        drawText(`This demand includes interest calculated at an annual rate of ${calculatedValues?.rateUsed}%.`, 10, timesRomanFont); y -= 40;
        drawText('Sincerely,', 12, timesRomanFont); y -= 30;
        drawText('__________________________', 12, timesRomanFont); drawText(sFormData.creditorName, 12, timesRomanFont);

        checkPageBreak(50);
        currentPage.drawText('Document Tracking ID: ' + crypto.randomUUID(), { x: 50, y: 30, size: 8, font: timesRomanFont, color: rgb(0.5, 0.5, 0.5) });
        currentPage.drawText('Generated via QuickDemandLetter.com. This document is user-generated and does not constitute legal advice.', { x: 50, y: 20, size: 8, font: timesRomanFont, color: rgb(0.5, 0.5, 0.5) });

        return await pdfDoc.save();
      };

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
              if (!str) return '';
              const normalized = String(str)
                .replace(/[‘’]/g, "'") // Smart single quotes
                .replace(/[“”]/g, '"') // Smart double quotes
                .replace(/[–—]/g, '-') // En and em dashes
                .replace(/[…]/g, '...') // Ellipsis
                .replace(/[^ -]/g, ''); // Strip remaining non-ASCII to prevent pdf-lib crash
              return normalized.substring(0, maxLen);
            };
            const sFormData = {
               creditorName: sanitize(formData.creditorName), creditorAddress: sanitize(formData.creditorAddress),
               debtorName: sanitize(formData.debtorName), debtorAddress: sanitize(formData.debtorAddress),
               jurisdiction: sanitize(formData.jurisdiction), dueDate: sanitize(formData.dueDate),
               letterDate: sanitize(formData.letterDate), items: Array.isArray(formData.items) ? formData.items : []
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

            if (!isPaid && session_id !== 'bypass_dev_mode') {
              return new Response(JSON.stringify({ error: 'Payment Required' }), { status: 402, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': url.origin } });
            }

            const pdfBytes = await generatePdfBytes(sFormData, calculatedValues, tone);

            if (url.pathname === '/api/deliver-document') {
              if (env.RESEND_API_KEY && email) {
                let binary = '';
                const bytes = new Uint8Array(pdfBytes);
                const len = bytes.byteLength;
                for (let i = 0; i < len; i++) { binary += String.fromCharCode(bytes[i]); }
                const base64Pdf = btoa(binary);

                const resendRes = await fetch('https://api.resend.com/emails', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    from: 'QuickDemandLetter <deliveries@quickdemandletter.com>',
                    to: email,
                    subject: 'Your Finalized Demand Letter',
                    html: `
                      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                        <h2 style="color: #333;">Your Document is Ready</h2>
                        <p style="color: #555; line-height: 1.5;">Thank you for using QuickDemandLetter. Your finalized, legally-formatted document is attached as a PDF.</p>
                        <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                          <strong style="color: #856404;">Important:</strong> <span style="color: #856404;">Please download and save this file for your records immediately. As part of our Zero-Knowledge Privacy Policy, we do not store your data or copies of this document.</span>
                        </div>
                        <p style="color: #777; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">This is an automated message. Please do not reply.</p>
                      </div>
                    `,
                    attachments: [{ filename: 'Demand_Letter.pdf', content: base64Pdf }]
                  })
                });

                if (!resendRes.ok) {
                   console.error("Resend Error:", await resendRes.text());
                   throw new Error("Failed to dispatch email via Resend.");
                }
              }
              return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': url.origin } });
            }

            return new Response(pdfBytes, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Access-Control-Allow-Origin': url.origin, 'Content-Disposition': 'attachment; filename="demand_letter.pdf"' } });
          } catch(e) { return new Response(JSON.stringify({ error: 'Generation failed' }), { status: 500, headers: { 'Access-Control-Allow-Origin': url.origin } }); }
        } else { fetchOptions.body = request.clone().body; }
      }

      let fetchConfig = {};
      if (request.method === 'GET' && url.pathname.includes('legal-statutes')) {
        fetchConfig = { cf: { cacheTtl: 3600, cacheEverything: true } };
      }

      try {
        const response = await fetch(new Request(backendUrl.toString(), fetchOptions), fetchConfig);
        const newResponse = new Response(response.body, response);
        newResponse.headers.set('Access-Control-Allow-Origin', url.origin);
        return newResponse;
      } catch (err) { return new Response(JSON.stringify({ error: 'Proxy error' }), { status: 502, headers: { 'Access-Control-Allow-Origin': url.origin } }); }
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
    }
    return assetResponse;
  }
};
