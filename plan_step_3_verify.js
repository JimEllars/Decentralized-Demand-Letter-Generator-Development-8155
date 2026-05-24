import fs from 'fs';

let content = fs.readFileSync('worker.js', 'utf8');
if (!content.includes('/api/health')) throw new Error("Missing /api/health");
if (content.includes('X-RateLimit')) throw new Error("Mock rate limit headers not removed");

console.log("Step 3 verification passed!");
