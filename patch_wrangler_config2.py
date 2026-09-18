with open("wrangler.jsonc", "r") as f:
    content = f.read()

content = content.replace('"id": "",', '"id": "TELEMETRY_KV_ID",')
content = content.replace('"preview_id": ""', '"preview_id": "TELEMETRY_KV_PREVIEW_ID"')

with open("wrangler.jsonc", "w") as f:
    f.write(content)
