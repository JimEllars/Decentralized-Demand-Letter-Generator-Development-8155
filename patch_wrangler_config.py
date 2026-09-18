with open("wrangler.jsonc", "r") as f:
    content = f.read()

content = content.replace("REPLACE_WITH_TELEMETRY_KV_ID", "")
content = content.replace("REPLACE_WITH_PREVIEW_KV_ID", "")

with open("wrangler.jsonc", "w") as f:
    f.write(content)
