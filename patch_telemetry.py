import re

with open("worker.js", "r") as f:
    content = f.read()

# Replace reportToCore
new_reportToCore = """const reportToCore = async (eventName, details, env) => {
  try {
    if (env && env.AXIM_TELEMETRY_URL) {
      await fetch(env.AXIM_TELEMETRY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.AXIM_TELEMETRY_KEY || ''}`
        },
        body: JSON.stringify({
          app_id: "axim-demand-letter-generator",
          event_type: eventName,
          timestamp: new Date().toISOString(),
          metadata: details
        })
      });
    }
  } catch(e) {
    // fail silently
  }
};"""

content = re.sub(
    r"const reportToCore = async \(eventName, details, env\) => \{.*?^\};" ,
    new_reportToCore,
    content,
    flags=re.DOTALL | re.MULTILINE
)

# Replace fallback for admin telemetry logs
admin_telemetry_replacement = """              if (env.TELEMETRY_KV) {
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
                  return new Response(JSON.stringify({ status: "unbound", events: [] }), {
                      status: 200,
                      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin }
                  });
              }"""

content = re.sub(
    r"              if \(env\.TELEMETRY_KV\) \{.*?              \} else \{\n                  console\.warn\('KV not bound'\);\n              \}",
    admin_telemetry_replacement,
    content,
    flags=re.DOTALL | re.MULTILINE
)


with open("worker.js", "w") as f:
    f.write(content)
