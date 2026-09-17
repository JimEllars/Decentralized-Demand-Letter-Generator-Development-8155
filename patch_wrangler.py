import json

with open("wrangler.jsonc", "r") as f:
    content = f.read()

# Using regex or simple string replacement since it's JSON with comments
import re

if '"kv_namespaces"' not in content:
    content = content.replace('"vars":', '  "kv_namespaces": [\n    {\n      "binding": "TELEMETRY_KV",\n      "id": "REPLACE_WITH_TELEMETRY_KV_ID",\n      "preview_id": "REPLACE_WITH_PREVIEW_KV_ID"\n    }\n  ],\n  "vars":')
    with open("wrangler.jsonc", "w") as f:
        f.write(content)
