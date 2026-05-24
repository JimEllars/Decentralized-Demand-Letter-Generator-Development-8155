const fs = require('fs');

let content = fs.readFileSync('worker.js', 'utf8');

// Add health endpoint
content = content.replace(
  `      if (request.method === 'GET' && url.pathname === '/api/v1/legal-statutes') {`,
  `      // --- HEALTH CHECK ---
      if (request.method === 'GET' && url.pathname === '/api/health') {
        return new Response(JSON.stringify({ status: "ok", version: "1.1.0", uptime: Math.floor(process.uptime ? process.uptime() : performance.now() / 1000) }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin }
        });
      }

      if (request.method === 'GET' && url.pathname === '/api/v1/legal-statutes') {`
);

fs.writeFileSync('worker.js', content);
