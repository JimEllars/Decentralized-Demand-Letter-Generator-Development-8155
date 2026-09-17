import re

with open("worker.js", "r") as f:
    content = f.read()

# Replace the EmailIt request body
new_email_it = """              const emailItRes = await fetch('https://api.emailit.com/v1/send', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${env.EMAILIT_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  from: 'AXiM Legal Desk <deliveries@emailit.axim.us.com>',
                  reply_to: 'support@axim.us.com',
                  to: [email],
                  subject: 'Your Demand Letter PDF is Ready',
                  html: '<div style="font-family: monospace; max-width: 600px; margin: 0 auto; background-color: #000; color: #f4f4f5; border: 1px solid #27272a; border-radius: 8px; overflow: hidden;"><div style="background-color: #18181b; padding: 24px; text-align: center; border-bottom: 2px solid #00e5ff;"><h1 style="margin: 0; color: #00e5ff; font-size: 20px; text-transform: uppercase; letter-spacing: 2px;">AXiM Documents</h1></div><div style="padding: 32px;"><h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Your Document is Ready</h2><p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">Thank you for your purchase. Your formally structured Demand Letter has been securely generated and is attached to this email as a PDF.</p><div style="background-color: #18181b; border-left: 3px solid #f59e0b; padding: 16px; margin: 24px 0;"><p style="margin: 0; font-size: 12px; color: #fbbf24; font-weight: bold; text-transform: uppercase;">⚠️ Important Privacy Notice</p><p style="margin: 8px 0 0 0; font-size: 12px; line-height: 1.5; color: #a1a1aa;">We utilize a strict Zero-Knowledge architecture. We do not store your data. <strong>Please save the attached PDF to your local device permanently.</strong></p></div></div></div>',
                  attachments: [{ filename: safeFilename, content: pdfData }]
                })
              });"""

content = re.sub(
    r"              const emailItRes = await fetch\('https:\/\/api\.emailit\.com\/v2\/emails'.*?              \}\);",
    new_email_it,
    content,
    flags=re.DOTALL | re.MULTILINE
)

with open("worker.js", "w") as f:
    f.write(content)
