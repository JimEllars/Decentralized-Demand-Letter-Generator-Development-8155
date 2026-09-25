const fs = require('fs');

let code = fs.readFileSync('wrangler.jsonc', 'utf8');

code = code.replace(
  '"id": "00000000000000000000000000000000"',
  '"id": "REPLACE_WITH_TELEMETRY_KV_ID"'
);

code = code.replace(
  '"preview_id": "00000000000000000000000000000001"',
  '"preview_id": "REPLACE_WITH_PREVIEW_KV_ID"'
);

// Remove AI binding completely
code = code.replace(/,\s*"ai":\s*\{\s*"binding":\s*"AI"\s*\}/g, '');
code = code.replace(/"ai":\s*\{\s*"binding":\s*"AI"\s*\},\s*/g, '');

fs.writeFileSync('wrangler.jsonc', code);
console.log('reverted wrangler.jsonc');
