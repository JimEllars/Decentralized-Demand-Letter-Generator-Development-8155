const fs = require('fs');

function cleanJsonc(str) {
  return str.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m);
}

let wranglerConfigStr = fs.readFileSync('wrangler.jsonc', 'utf8');
let wranglerConfig;

try {
  wranglerConfig = JSON.parse(cleanJsonc(wranglerConfigStr));
} catch (e) {
  console.error('Failed to parse wrangler.jsonc', e);
  process.exit(1);
}

const kvId = process.env.TELEMETRY_KV_ID;
const isValidHex = /^[a-f0-9]{32}$/i.test(kvId || '');

if (isValidHex) {
  const namespace = {
    binding: "TELEMETRY_KV",
    id: kvId
  };

  if (process.env.TELEMETRY_KV_PREVIEW_ID && /^[a-f0-9]{32}$/i.test(process.env.TELEMETRY_KV_PREVIEW_ID)) {
    namespace.preview_id = process.env.TELEMETRY_KV_PREVIEW_ID;
  }

  wranglerConfig.kv_namespaces = [namespace];
} else {
  console.log('[Wrangler Config] No valid TELEMETRY_KV_ID detected. Omitted TELEMETRY_KV binding to allow build completion.');
  delete wranglerConfig.kv_namespaces;
}

fs.writeFileSync('wrangler.json', JSON.stringify(wranglerConfig, null, 2));

const distWranglerPath = 'dist/demand_letter_generator_app_v1_axim/wrangler.json';
if (fs.existsSync(distWranglerPath)) {
  let distWranglerConfig = JSON.parse(fs.readFileSync(distWranglerPath, 'utf8'));

  if (isValidHex) {
    const namespace = {
      binding: "TELEMETRY_KV",
      id: kvId
    };

    if (process.env.TELEMETRY_KV_PREVIEW_ID && /^[a-f0-9]{32}$/i.test(process.env.TELEMETRY_KV_PREVIEW_ID)) {
      namespace.preview_id = process.env.TELEMETRY_KV_PREVIEW_ID;
    }

    distWranglerConfig.kv_namespaces = [namespace];
  } else {
    delete distWranglerConfig.kv_namespaces;
  }

  fs.writeFileSync(distWranglerPath, JSON.stringify(distWranglerConfig, null, 2));
}
