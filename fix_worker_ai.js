const fs = require('fs');

let workerCode = fs.readFileSync('worker.js', 'utf8');

// I also added AI bindings to wrangler, let's see if that broke anything. No, it shouldn't.
// Wait, the Github CI failed on "Workers Builds: demand-letter-generator-app-v1-axim"
// Look at the github actions configuration.
