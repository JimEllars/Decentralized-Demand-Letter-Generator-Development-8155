with open("wrangler.jsonc", "r") as f:
    content = f.read()

import json
import re

# Remove kv_namespaces entirely if it's causing issues
content = re.sub(
    r'"kv_namespaces": \[\n    {\n      "binding": "TELEMETRY_KV",\n      "id": "00000000000000000000000000000000",\n      "preview_id": "00000000000000000000000000000000"\n    }\n  \],',
    '"kv_namespaces": [\n    {\n      "binding": "TELEMETRY_KV",\n      "id": "e63b6528751543fc95e69e0ee2546dbf",\n      "preview_id": "e63b6528751543fc95e69e0ee2546dbf"\n    }\n  ],',
    content
)

with open("wrangler.jsonc", "w") as f:
    f.write(content)
