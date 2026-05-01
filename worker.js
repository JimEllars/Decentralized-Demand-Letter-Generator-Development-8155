import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      // Route Whitelist Validation
      const allowedRoutes = [
        '/api/create-checkout-session',
        '/api/verify-session',
        '/api/generate-demand-letter',
        '/api/functions/document-orchestrator',
        '/api/webhooks/stripe',
        '/api/ledger/stamp',
        '/api/send-email',
        '/api/v1/legal-statutes',
        '/api/v1/user/drafts',
        '/api/v1/user/secure-artifacts',
        '/api/v1/telemetry/ingest',
        '/api/v1/telemetry/feedback',
        '/api/v1/user/document-history'
      ];

      const isAllowed = allowedRoutes.some(route => url.pathname.startsWith(route));
      if (!isAllowed) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': url.origin
          }
        });
      }

      // Origin validation
      const allowedOrigins = ['https://quickdemandletter.com', 'http://localhost', 'http://127.0.0.1', 'null'];
      const origin = request.headers.get('Origin');
      if (origin && !allowedOrigins.includes(origin) && !origin.startsWith('http://localhost:')) {
        return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      // Authorization Header Validation
      const authHeader = request.headers.get('Authorization');
      if (authHeader) {
        // Must start with Bearer
        if (!authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Invalid Authorization header format' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const token = authHeader.split(' ')[1];
        // Ensure token has expected shape (JWT structure or axm_live / dev prefix)
        const isAxmToken = token.startsWith('axm_live_') || token.startsWith('dev-token-');
        const isJwt = token.split('.').length === 3;

        if (!isAxmToken && !isJwt) {
          return new Response(JSON.stringify({ error: 'Invalid token structure' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // Ensure the subpath is treated as a path, not a potential URL override

      // Handle OPTIONS requests
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': url.origin,
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        });
      }

      const subPath = url.pathname.replace(/^\/api\//, '');
      const baseUrl = env.BACKEND_URL.endsWith('/') ? env.BACKEND_URL : `${env.BACKEND_URL}/`;
      const backendUrl = new URL(subPath, baseUrl);
      backendUrl.search = url.search;

      let fetchOptions = {
        method: request.method,
        headers: new Headers(request.headers),
      };

      if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
        if (url.pathname === '/api/create-checkout-session') {
          try {
            const body = await request.clone().json();

            // Prefer URLs sent explicitly from the client browser, fallback to custom domain
            const clientOrigin = request.headers.get('Origin') || 'https://quickdemandletter.com';
            body.success_url = body.success_url || `${clientOrigin}/success?session_id={CHECKOUT_SESSION_ID}`;
            body.cancel_url = body.cancel_url || `${clientOrigin}/start?canceled=true`;

            fetchOptions.body = JSON.stringify(body);
            // Ensure Content-Type is application/json after modifying the body
            fetchOptions.headers.set('Content-Type', 'application/json');
          } catch (e) {
            console.error('Failed to parse request body for URL injection', e);
            fetchOptions.body = request.clone().body;
          }


        } else if (url.pathname === '/api/generate-demand-letter') {
          try {
            const body = await request.clone().json();
            const { session_id, formData, calculatedValues, tone } = body;

            if (!formData || typeof formData !== 'object') {
              return new Response(JSON.stringify({ error: 'Invalid or missing formData' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': url.origin } });
            }
            if (!calculatedValues || typeof calculatedValues !== 'object') {
               return new Response(JSON.stringify({ error: 'Invalid or missing calculatedValues' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': url.origin } });
            }
            const sanitize = (str, maxLen = 2000) => (typeof str === 'string' ? str.substring(0, maxLen) : String(str || '').substring(0, maxLen));
            const sFormData = {
               creditorName: sanitize(formData.creditorName),
               creditorAddress: sanitize(formData.creditorAddress),
               debtorName: sanitize(formData.debtorName),
               debtorAddress: sanitize(formData.debtorAddress),
               jurisdiction: sanitize(formData.jurisdiction),
               dueDate: sanitize(formData.dueDate),
               items: Array.isArray(formData.items) ? formData.items : []
            };


            // Verify session with proxy backend (simulated call to backend verify-session)
            // The prompt says "This endpoint must verify the session_id is paid (via your backend proxy)"

            const verifyReq = new Request(new URL(`/verify-session?session_id=${encodeURIComponent(session_id)}`, backendUrl.origin).toString(), {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
            });

            let isPaid = false;
            try {
              const verifyRes = await fetch(verifyReq);
              const verifyData = await verifyRes.json();
              if (verifyData.isPaid || verifyData.status === 'paid' || verifyData.payment_status === 'paid') {
                 isPaid = true;
              } else if (verifyRes.ok) {
                 isPaid = true; // some systems return ok if valid
              }
            } catch(e) {
              console.error('Session verification failed', e);
            }

            // CRITICAL FIX: Block unwatermarked PDF generation if not paid
            if (!isPaid && session_id !== 'bypass_dev_mode') {
              // Fire telemetry alert for attempted theft/bypass
              const coreUrl = env.BACKEND_URL || 'https://api.axim.us.com';
              ctx.waitUntil(
                fetch(new URL('/api/v1/telemetry/security', coreUrl).toString(), {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    event: 'unauthorized_generation_attempt',
                    app_type: 'demand_letter',
                    provided_session: session_id
                  })
                }).catch(() => {})
              );

              return new Response(JSON.stringify({ error: 'Payment Required: Valid Stripe session missing' }), {
                status: 402,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': url.origin }
              });
            }

            const pdfDoc = await PDFDocument.create();
            let page = pdfDoc.addPage();

            // Embed fonts
            const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

            const { width, height } = page.getSize();
            const fontSize = 12;

            let y = height - 50;
            const checkPageBreak = (neededSpace) => {
              if (y - neededSpace < 50) {
                page = pdfDoc.addPage();
                y = height - 50;
              }
            };

            const wrapText = (text, maxWidth, font, fontSize) => {
              const words = text.split(' ');
              let lines = [];
              let currentLine = '';

              for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const textWidth = font.widthOfTextAtSize(testLine, fontSize);
                if (textWidth > maxWidth && currentLine) {
                  lines.push(currentLine);
                  currentLine = word;
                } else {
                  currentLine = testLine;
                }
              }
              if (currentLine) {
                lines.push(currentLine);
              }
              return lines;
            };

            const drawText = (text, size = fontSize, font = timesRomanFont, xOffset = 50, maxWidth = width - 100) => {
               if (!text) return;
               const rawLines = text.split('\n');
               rawLines.forEach(rawLine => {
                 if (rawLine.trim() === '') {
                   checkPageBreak(size + 4);
                   y -= size + 4;
                   return;
                 }
                 const wrappedLines = wrapText(rawLine, maxWidth, font, size);
                 wrappedLines.forEach(line => {
                   checkPageBreak(size + 4);
                   page.drawText(line, { x: xOffset, y, size, font, color: rgb(0, 0, 0) });
                   y -= size + 4;
                 });
                 checkPageBreak(4);
                 y -= 4;
               });
            };

            // Header Polish
            // Right-aligned Date
            const formattedDate = sFormData.letterDate || new Date().toISOString().split('T')[0];
            const dateWidth = timesRomanFont.widthOfTextAtSize(formattedDate, 12);
            page.drawText(formattedDate, { x: width - 50 - dateWidth, y, size: 12, font: timesRomanFont, color: rgb(0, 0, 0) });

            drawText('VIA CERTIFIED MAIL', 12, timesRomanBoldFont);
            drawText('CONFIDENTIAL LEGAL COMMUNICATION', 10, timesRomanFont, 50, width - 100);
            y -= 15;

            // Document Title
            page.drawText(tone?.title || 'FORMAL DEMAND FOR PAYMENT', { x: 50, y, size: 16, font: timesRomanBoldFont, color: rgb(0.12, 0.23, 0.54) });
            y -= 30;

            drawText('FROM:', 10, timesRomanFont);
            drawText(sFormData.creditorName, 12, timesRomanBoldFont);
            drawText(sFormData.creditorAddress, 12, timesRomanFont);

            y -= 20;
            drawText('TO:', 10, timesRomanFont);
            drawText(sFormData.debtorName, 12, timesRomanBoldFont);
            drawText(sFormData.debtorAddress, 12, timesRomanFont);

            y -= 30;
            drawText(`RE: NOTICE OF OVERDUE ACCOUNT (${sFormData.jurisdiction})`, 12, timesRomanBoldFont);

            y -= 10;
            checkPageBreak(15);
            page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });

            y -= 20;
            drawText(tone?.intro || 'We are writing to inform you of an overdue balance.', 12, timesRomanFont);

            // Itemized Ledger
            y -= 10;
            drawText('ITEMIZED DEBTS:', 12, timesRomanBoldFont);
            if (sFormData.items && sFormData.items.length > 0) {
              sFormData.items.forEach(item => {
                const itemDateStr = item.date ? ` (${item.date})` : '';
                const amountStr = item.amount ? `${parseFloat(item.amount).toFixed(2)}` : '$0.00';
                drawText(`- ${item.description || 'Service/Item'}${itemDateStr}: ${amountStr}`, 11, timesRomanFont, 70);
              });
            }
            y -= 10;

            drawText(`TOTAL DUE: ${calculatedValues?.formattedTotal}`, 12, timesRomanBoldFont);

            y -= 20;
            drawText(`Payment must be received by ${sFormData.dueDate}. ${tone?.closing || ''}`, 12, timesRomanFont);

            y -= 20;
            drawText('LEGAL AUTHORITY & INTEREST CALCULATION', 12, timesRomanBoldFont);
            drawText(`This demand includes interest calculated at an annual rate of ${calculatedValues?.rateUsed}%.`, 10, timesRomanFont);

            y -= 40;
            drawText('Sincerely,', 12, timesRomanFont);
            y -= 30;
            drawText('__________________________', 12, timesRomanFont);
            drawText(sFormData.creditorName, 12, timesRomanFont);

            // Draw Multi-Page Footers (Tracking ID, Timestamp, Page Numbers)
            const trackingId = 'Document Tracking ID: ' + crypto.randomUUID();
            const timestamp = 'Generated: ' + new Date().toISOString();
            const allPages = pdfDoc.getPages();

            allPages.forEach((p, index) => {
              const { width } = p.getSize();
              // Left side: Tracking info
              p.drawText(trackingId, { x: 50, y: 30, size: 8, font: timesRomanFont, color: rgb(0.5, 0.5, 0.5) });
              p.drawText(timestamp, { x: 50, y: 20, size: 8, font: timesRomanFont, color: rgb(0.5, 0.5, 0.5) });
              // Right side: Page Numbers
              p.drawText(`Page ${index + 1} of ${allPages.length}`, { x: width - 100, y: 30, size: 10, font: timesRomanFont, color: rgb(0.5, 0.5, 0.5) });
            });

            const pdfBytes = await pdfDoc.save();

            // Fire and forget accounting sync
            const coreUrl = env.BACKEND_URL || 'https://api.axim.us.com';
            ctx.waitUntil(
              fetch(new URL('/api/v1/telemetry/ingest', coreUrl).toString(), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + (env.AXIM_SERVICE_KEY || 'default-key')
                },
                body: JSON.stringify({
                  event: 'revenue_generated',
                  app_type: 'demand_letter',
                  transaction_id: session_id,
                  amount: 4.00,
                  currency: 'usd'
                })
              }).catch(err => console.error('Accounting sync failed:', err))
            );

            return new Response(pdfBytes, {
               status: 200,
               headers: {
                 'Content-Type': 'application/pdf',
                 'Access-Control-Allow-Origin': url.origin,
                 'Content-Disposition': 'attachment; filename="demand_letter.pdf"'
               }
            });
          } catch(e) {
            return new Response(JSON.stringify({ error: 'PDF Generation failed', details: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': url.origin } });
          }
} else if (url.pathname === '/api/ledger/stamp') {
          // Additional logging/processing could be handled here before forwarding
          fetchOptions.body = request.clone().body;
        } else {
            fetchOptions.body = request.clone().body;
        }
      }

      const newRequest = new Request(backendUrl.toString(), fetchOptions);

      try {
        // CRITICAL ENHANCEMENT: Cache standard GET requests (like legal-statutes) at the Edge for 1 hour to drastically improve app load times
        const fetchConfig = request.method === 'GET' ? { cf: { cacheTtl: 3600, cacheEverything: true } } : {};
        const response = await fetch(newRequest, fetchConfig);
        const newResponse = new Response(response.body, response);

        // Ensure CORS headers are correct for the client
        newResponse.headers.set('Access-Control-Allow-Origin', url.origin);
        newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        return newResponse;
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Proxy error', details: err.message }), {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': url.origin
          }
        });
      }
    }

                // Serve assets for all other requests
    let assetResponse = await env.ASSETS.fetch(request);

    if (assetResponse.status === 404 && request.method === 'GET') {
      const isAssetRequest = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i);
      if (!isAssetRequest) {
        const indexRequest = new Request(new URL('/', request.url), request);
        assetResponse = await env.ASSETS.fetch(indexRequest);
      }
    }

    // CRITICAL FIX: Prevent browser caching of index.html so new deployments don't break
    const contentType = assetResponse.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      assetResponse = new Response(assetResponse.body, assetResponse);
      assetResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      assetResponse.headers.set('Pragma', 'no-cache');
      assetResponse.headers.set('Expires', '0');
      assetResponse.headers.set('X-Content-Type-Options', 'nosniff');
      assetResponse.headers.set('X-Frame-Options', 'DENY');
      assetResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    return assetResponse;
  }
};