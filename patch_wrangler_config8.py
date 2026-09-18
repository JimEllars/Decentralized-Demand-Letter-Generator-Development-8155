import re
with open("wrangler.jsonc", "r") as f:
    content = f.read()

content = re.sub(
    r'"kv_namespaces": \[\n    {\n      "binding": "TELEMETRY_KV",\n      "id": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",\n      "preview_id": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4"\n    }\n  \],',
    '"kv_namespaces": [\n    {\n      "binding": "TELEMETRY_KV",\n      "id": "cb17b8f0cc674254b7324df23351d182",\n      "preview_id": "cb17b8f0cc674254b7324df23351d182"\n    }\n  ],',
    content
)

with open("wrangler.jsonc", "w") as f:
    f.write(content)
