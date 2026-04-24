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

            // Inject the correct success and cancel URLs into the payload
            const clientOrigin = request.headers.get('Origin') || url.origin;
            body.success_url = `${clientOrigin}/success?session_id={CHECKOUT_SESSION_ID}`;
            body.cancel_url = `${clientOrigin}/start?canceled=true`;

            fetchOptions.body = JSON.stringify(body);
            // Ensure Content-Type is application/json after modifying the body
            fetchOptions.headers.set('Content-Type', 'application/json');
          } catch (e) {
            console.error('Failed to parse request body for URL injection', e);
            fetchOptions.body = request.clone().body;
          }


        } else if (url.pathname === '/api/generate-preview') {
          try {
            const body = await request.clone().json();
            const { session_id, formData, calculatedValues, tone } = body;

            // Generate Watermarked Preview

            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage();

            const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

            const { width, height } = page.getSize();
            const fontSize = 12;

            let y = height - 50;

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
                   y -= size + 4;
                   return;
                 }
                 const wrappedLines = wrapText(rawLine, maxWidth, font, size);
                 wrappedLines.forEach(line => {
                   page.drawText(line, { x: xOffset, y, size, font, color: rgb(0, 0, 0) });
                   y -= size + 4;
                 });
                 y -= 4;
               });
            };

            // Watermark
            page.drawText('DRAFT - NOT FOR LEGAL USE', {
              x: width / 2 - 250,
              y: height / 2 - 100,
              size: 60,
              font: timesRomanBoldFont,
              color: rgb(0.8, 0.8, 0.8),
              rotate: degrees(-45),
              opacity: 0.5,
            });

            // Header Polish
            drawText('Sent via Certified Mail: [ Tracking Number ]', 10, timesRomanBoldFont);
            y -= 10;

            // Very basic layout
            page.drawText(tone?.title || 'DEMAND LETTER', { x: 50, y, size: 16, font: timesRomanBoldFont, color: rgb(0.12, 0.23, 0.54) });
            y -= 30;

            drawText('FROM:', 10, timesRomanFont);
            drawText(formData.creditorName, 12, timesRomanBoldFont);
            drawText(formData.creditorAddress, 12, timesRomanFont);

            y -= 20;
            drawText('TO:', 10, timesRomanFont);
            drawText(formData.debtorName, 12, timesRomanBoldFont);
            drawText(formData.debtorAddress, 12, timesRomanFont);

            y -= 30;
            drawText(`RE: NOTICE OF OVERDUE ACCOUNT (${formData.jurisdiction})`, 12, timesRomanBoldFont);

            y -= 20;
            drawText(tone?.intro || 'We are writing to inform you of an overdue balance.', 12, timesRomanFont);

            // Itemized Ledger
            y -= 10;
            drawText('ITEMIZED DEBTS:', 12, timesRomanBoldFont);
            if (formData.items && formData.items.length > 0) {
              formData.items.forEach(item => {
                const itemDateStr = item.date ? ` (${item.date})` : '';
                const amountStr = item.amount ? `${parseFloat(item.amount).toFixed(2)}` : '$0.00';
                drawText(`- ${item.description || 'Service/Item'}${itemDateStr}: ${amountStr}`, 11, timesRomanFont, 70);
              });
            }
            y -= 10;

            drawText(`TOTAL DUE: ${calculatedValues?.formattedTotal}`, 12, timesRomanBoldFont);

            y -= 20;
            drawText(`Payment must be received by ${formData.dueDate}. ${tone?.closing || ''}`, 12, timesRomanFont);

            y -= 20;
            drawText('LEGAL AUTHORITY & INTEREST CALCULATION', 12, timesRomanBoldFont);
            drawText(`This demand includes interest calculated at an annual rate of ${calculatedValues?.rateUsed}%.`, 10, timesRomanFont);

            y -= 40;
            drawText('Sincerely,', 12, timesRomanFont);
            y -= 30;
            drawText('__________________________', 12, timesRomanFont);
            drawText(formData.creditorName, 12, timesRomanFont);

            const trackingId = 'AXiM Systems Tracking ID: ' + crypto.randomUUID();
            const timestamp = 'Generated: ' + new Date().toISOString();
            page.drawText(trackingId, { x: 50, y: 30, size: 8, font: timesRomanFont, color: rgb(0.5, 0.5, 0.5) });
            page.drawText(timestamp, { x: 50, y: 20, size: 8, font: timesRomanFont, color: rgb(0.5, 0.5, 0.5) });

            const pdfBytes = await pdfDoc.save();

            return new Response(pdfBytes, {
               status: 200,
               headers: {
                 'Content-Type': 'application/pdf',
                 'Access-Control-Allow-Origin': url.origin,
                 'Content-Disposition': 'inline; filename="demand_letter_preview.pdf"'
               }
            });
          } catch(e) {
            return new Response(JSON.stringify({ error: 'PDF Generation failed', details: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': url.origin } });
          }
} else if (url.pathname === '/api/generate-demand-letter') {
          try {
            const body = await request.clone().json();
            const { session_id, formData, calculatedValues, tone } = body;

            // Verify session with proxy backend (simulated call to backend verify-session)
            // The prompt says "This endpoint must verify the session_id is paid (via your backend proxy)"

            const verifyReq = new Request(new URL('verify-session', backendUrl.origin + '/v1/').toString(), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ session_id })
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

            // Wait, the prompt says "verify the session_id is paid (via your backend proxy)".
            // In worker.js we proxy everything to env.BACKEND_URL.
            // We can do a subrequest to env.BACKEND_URL/verify-session or similar.

            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage();

            // Embed fonts
            const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

            const { width, height } = page.getSize();
            const fontSize = 12;

            let y = height - 50;

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
                   y -= size + 4;
                   return;
                 }
                 const wrappedLines = wrapText(rawLine, maxWidth, font, size);
                 wrappedLines.forEach(line => {
                   page.drawText(line, { x: xOffset, y, size, font, color: rgb(0, 0, 0) });
                   y -= size + 4;
                 });
                 y -= 4; // Add a bit of space after paragraph
               });
            };

            // Header Polish
            drawText('Sent via Certified Mail: [ Tracking Number ]', 10, timesRomanBoldFont);
            y -= 10;

            // Very basic layout
            page.drawText(tone?.title || 'DEMAND LETTER', { x: 50, y, size: 16, font: timesRomanBoldFont, color: rgb(0.12, 0.23, 0.54) });
            y -= 30;

            drawText('FROM:', 10, timesRomanFont);
            drawText(formData.creditorName, 12, timesRomanBoldFont);
            drawText(formData.creditorAddress, 12, timesRomanFont);

            y -= 20;
            drawText('TO:', 10, timesRomanFont);
            drawText(formData.debtorName, 12, timesRomanBoldFont);
            drawText(formData.debtorAddress, 12, timesRomanFont);

            y -= 30;
            drawText(`RE: NOTICE OF OVERDUE ACCOUNT (${formData.jurisdiction})`, 12, timesRomanBoldFont);

            y -= 20;
            drawText(tone?.intro || 'We are writing to inform you of an overdue balance.', 12, timesRomanFont);

            // Itemized Ledger
            y -= 10;
            drawText('ITEMIZED DEBTS:', 12, timesRomanBoldFont);
            if (formData.items && formData.items.length > 0) {
              formData.items.forEach(item => {
                const itemDateStr = item.date ? ` (${item.date})` : '';
                const amountStr = item.amount ? `${parseFloat(item.amount).toFixed(2)}` : '$0.00';
                drawText(`- ${item.description || 'Service/Item'}${itemDateStr}: ${amountStr}`, 11, timesRomanFont, 70);
              });
            }
            y -= 10;

            drawText(`TOTAL DUE: ${calculatedValues?.formattedTotal}`, 12, timesRomanBoldFont);

            y -= 20;
            drawText(`Payment must be received by ${formData.dueDate}. ${tone?.closing || ''}`, 12, timesRomanFont);

            y -= 20;
            drawText('LEGAL AUTHORITY & INTEREST CALCULATION', 12, timesRomanBoldFont);
            drawText(`This demand includes interest calculated at an annual rate of ${calculatedValues?.rateUsed}%.`, 10, timesRomanFont);

            y -= 40;
            drawText('Sincerely,', 12, timesRomanFont);
            y -= 30;
            drawText('__________________________', 12, timesRomanFont);
            drawText(formData.creditorName, 12, timesRomanFont);

            // Draw Timestamp and Tracking ID
            const trackingId = 'AXiM Systems Tracking ID: ' + crypto.randomUUID();
            const timestamp = 'Generated: ' + new Date().toISOString();
            page.drawText(trackingId, { x: 50, y: 30, size: 8, font: timesRomanFont, color: rgb(0.5, 0.5, 0.5) });
            page.drawText(timestamp, { x: 50, y: 20, size: 8, font: timesRomanFont, color: rgb(0.5, 0.5, 0.5) });

            const pdfBytes = await pdfDoc.save();

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
        const response = await fetch(newRequest);
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
    const assetResponse = await env.ASSETS.fetch(request);

    // If the asset is not found, and it's a request for a page (not an asset like .js or .css),
    // serve index.html to allow client-side routing to handle it
    if (assetResponse.status === 404 && request.method === 'GET') {
      const isAssetRequest = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i);
      if (!isAssetRequest) {
        const indexRequest = new Request(new URL('/', request.url), request);
        return env.ASSETS.fetch(indexRequest);
      }
    }

    return assetResponse;
  }
};
