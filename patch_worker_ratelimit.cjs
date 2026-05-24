const fs = require('fs');

let content = fs.readFileSync('worker.js', 'utf8');
content = content.replace(
  `            // Adding mock rate limit headers
            corsHeaders['X-RateLimit-Limit'] = '100';
            corsHeaders['X-RateLimit-Remaining'] = '99';
            corsHeaders['X-RateLimit-Reset'] = Math.floor(Date.now() / 1000) + 3600;`,
  ``
);

fs.writeFileSync('worker.js', content);
