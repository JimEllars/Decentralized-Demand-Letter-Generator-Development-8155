const fs = require('fs');

// In Github Actions, dummy IDs like "REPLACE_WITH_TELEMETRY_KV_ID" cause Wrangler deploy to fail because it needs a valid 32-character hexadecimal KV ID.

let code = fs.readFileSync('wrangler.jsonc', 'utf8');

code = code.replace(
  '"id": "REPLACE_WITH_TELEMETRY_KV_ID"',
  '"id": "00000000000000000000000000000000"'
);

code = code.replace(
  '"preview_id": "REPLACE_WITH_PREVIEW_KV_ID"',
  '"preview_id": "00000000000000000000000000000001"'
);

fs.writeFileSync('wrangler.jsonc', code);
console.log('patched wrangler.jsonc with dummy valid hexadecimal IDs');
