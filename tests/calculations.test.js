
import assert from 'node:assert';
import { calculateTotal } from '../src/utils/calculations.js';
import { STATE_LEGAL_DETAILS } from '../src/utils/constants.js';

console.log('Running calculation tests...');

// Mock data
const items = [{ amount: '1000' }];
const dueDate = '2023-01-01';
const letterDate = '2024-01-01'; // 1 year later = 365 days

// Test 1: Default State Interest (CA = 10%)
{
  const result = calculateTotal(items, '', dueDate, 'CA', letterDate);
  const expectedInterest = 1000 * 0.10; // 100
  assert.strictEqual(result.principal, 1000);
  assert.ok(Math.abs(result.interest - expectedInterest) < 0.01, `Expected interest ~${expectedInterest}, got ${result.interest}`);
  console.log('Test 1 Passed: Default State Interest');
}

// Test 2: Custom Interest Rate (5%)
{
  const result = calculateTotal(items, '5', dueDate, 'CA', letterDate);
  const expectedInterest = 1000 * 0.05; // 50
  assert.ok(Math.abs(result.interest - expectedInterest) < 0.01, `Expected interest ~${expectedInterest}, got ${result.interest}`);
  console.log('Test 2 Passed: Custom Interest Rate');
}

// Test 3: Explicit 0% Interest
// Currently this fails or defaults to state interest depending on implementation
{
  const result = calculateTotal(items, '0', dueDate, 'CA', letterDate);
  // We want this to be 0 interest
  if (result.interest === 0) {
      console.log('Test 3 Passed: Explicit 0% Interest');
  } else {
      console.log(`Test 3 Failed: Expected 0 interest, got ${result.interest} (Likely defaulted to state rate)`);
  }
}

// Test 4: Empty Interest (Should default to state)
{
  const result = calculateTotal(items, '', dueDate, 'CA', letterDate);
  const expectedInterest = 1000 * 0.10;
  assert.ok(Math.abs(result.interest - expectedInterest) < 0.01);
  console.log('Test 4 Passed: Empty Interest defaults to state');
}

console.log('All tests finished.');
