import sys

def patch():
    with open('worker.js', 'r') as f:
        content = f.read()

    # Find the block where /api/generate-demand-letter is handled.
    # The `} else { fetchOptions.body = request.clone().body; }` is right after the generate-demand-letter catch block.

    target = """          }
        } else {"""

    replacement = """          }
        } else if (url.pathname === '/api/send-email') {
          try {
            const { email, pdfData } = await request.clone().json();
            if (!email || !pdfData) return new Response(JSON.stringify({ error: 'Missing payload' }), { status: 400, headers: { 'Access-Control-Allow-Origin': url.origin } });

            // Dispatch via Resend Email API
            const resendRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: 'QuickDemandLetter <deliveries@quickdemandletter.com>',
                to: [email],
                subject: 'Your Demand Letter PDF is Ready',
                html: '<p>Thank you for using QuickDemandLetter. Your secure PDF is attached to this email.</p><p><strong>Important Privacy Notice:</strong> We utilize a strict Zero-Knowledge architecture and do not store your data or documents on our servers. Please save this attached PDF to your device permanently.</p>',
                attachments: [{ filename: 'Demand_Letter_Final.pdf', content: pdfData }]
              })
            });

            if (!resendRes.ok) throw new Error('Email provider failed to dispatch');
            return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': url.origin } });
          } catch (err) {
            return new Response(JSON.stringify({ error: 'Email dispatch failed' }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': url.origin } });
          }
        } else {"""

    if target not in content:
        print("Target string not found!")
        sys.exit(1)

    new_content = content.replace(target, replacement)

    with open('worker.js', 'w') as f:
        f.write(new_content)

patch()
