import { execSync } from 'child_process';

const log = execSync('git log -1').toString();
if (!log.includes('chore: Final review and submit for production hardening sprint')) {
  throw new Error("Missing commit");
}

console.log("Step 4 verification passed!");
