const fs = require('fs');

let content = fs.readFileSync('tests/usePayment.test.jsx', 'utf8');

// Un-skip tests
content = content.replace(
  `it.skip('handlePayment works correctly on success', async () => {`,
  `it('handlePayment works correctly on success', async () => {`
);

content = content.replace(
  `it.skip('handlePayment handles payment processing error', async () => {`,
  `it('handlePayment handles payment processing error', async () => {`
);

// Add the mock configuration right after imports
content = content.replace(
  `import { renderHook, act } from '@testing-library/react';`,
  `import { renderHook, act } from '@testing-library/react';
import * as telemetry from '../src/utils/telemetry';

vi.mock('../src/utils/telemetry', () => ({
  logSystemEvent: vi.fn(),
}));`
);

fs.writeFileSync('tests/usePayment.test.jsx', content);
