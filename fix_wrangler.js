const fs = require('fs');

let code = fs.readFileSync('wrangler.jsonc', 'utf8');

// Some wrangler versions fail if preview_id is exactly "00000000000000000000000000000001" and it's not a valid ID.
// Instead of trying to guess a valid ID format, let's just remove KV namespaces entirely from wrangler.jsonc,
// since telemetry ingestion can still gracefully fail via the checking `if (env.TELEMETRY_KV)` and log properly,
// and we just added them in this PR.

// Oh actually, looking at the instruction: "Re-bind TELEMETRY_KV in wrangler.jsonc and provision the production KV namespace to restore /api/admin/telemetry-logs."
// Let's use the provided placeholder:
// "id": "REPLACE_WITH_TELEMETRY_KV_ID",
// "preview_id": "REPLACE_WITH_PREVIEW_KV_ID"
// Wait, I replaced it before because I thought it caused the deploy to fail.
// What if the error in the Github Action is from the test run?
