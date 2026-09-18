import re
with open("wrangler.jsonc", "r") as f:
    content = f.read()

# I am going to try just providing valid looking 32 char IDs since Wrangler strictly checks that preview_id and id are exact 32 character hex strings.

content = re.sub(
    r'"kv_namespaces": \[\n    {\n      "binding": "TELEMETRY_KV",\n      "id": "REPLACE_WITH_TELEMETRY_KV_ID",\n      "preview_id": "REPLACE_WITH_PREVIEW_KV_ID"\n    }\n  \],',
    '"kv_namespaces": [\n    {\n      "binding": "TELEMETRY_KV",\n      "id": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",\n      "preview_id": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4"\n    }\n  ],',
    content
)

with open("wrangler.jsonc", "w") as f:
    f.write(content)
