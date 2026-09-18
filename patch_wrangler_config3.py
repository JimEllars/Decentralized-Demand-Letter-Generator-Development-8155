with open("wrangler.jsonc", "r") as f:
    content = f.read()

content = content.replace("TELEMETRY_KV_ID", "00000000000000000000000000000000")
content = content.replace("TELEMETRY_KV_PREVIEW_ID", "00000000000000000000000000000000")

with open("wrangler.jsonc", "w") as f:
    f.write(content)
