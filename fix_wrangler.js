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

// Remove AI binding
code = code.replace(
  /,\s*"ai":\s*\{\s*"binding":\s*"AI"\s*\}/,
  ''
);
code = code.replace(
  /"ai":\s*\{\s*"binding":\s*"AI"\s*\},\s*/,
  ''
);

fs.writeFileSync('wrangler.jsonc', code);
console.log('reverted wrangler.jsonc to expected placeholder IDs and removed AI binding');
