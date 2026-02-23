
import assert from 'node:assert';
import { generatePdfDefinition } from '../src/services/pdfGenerator.js';
import { TONE_TEMPLATES } from '../src/utils/constants.js';

console.log('Running PDF generator tests...');

// Mock data
const formData = {
  jurisdiction: 'CA',
  creditorName: 'Creditor Inc',
  creditorAddress: '123 Main St',
  debtorName: 'Debtor LLC',
  debtorAddress: '456 Wall St',
  items: [{ description: 'Service', amount: '1000' }],
  dueDate: '2023-01-01',
  letterDate: '2023-06-01'
};

const calculatedValues = {
  formattedTotal: '$1,100.00',
  formattedInterest: '$100.00',
  rateUsed: '10.00',
  statuteUsed: 'Cal. Civ. Code § 3289'
};

const tone = TONE_TEMPLATES.firm;

// Test 1: Generate basic definition
{
  const doc = generatePdfDefinition(formData, calculatedValues, tone);
  assert.ok(doc.content.length > 0, 'Content should not be empty');

  // Check for creditor name
  const hasCreditor = JSON.stringify(doc).includes('Creditor Inc');
  assert.ok(hasCreditor, 'PDF should contain creditor name');

  // Check for CA specific clause
  const hasCAClause = JSON.stringify(doc).includes('Rosenthal Fair Debt Collection Practices Act');
  assert.ok(hasCAClause, 'PDF should contain CA specific legal disclosure');

  console.log('Test 1 Passed: Basic Generation');
}

// Test 2: Watermark option
{
  const doc = generatePdfDefinition(formData, calculatedValues, tone, { watermark: true });
  assert.ok(doc.watermark, 'Watermark property should exist');
  assert.strictEqual(doc.watermark.text, 'PREVIEW - NOT FOR USE');
  console.log('Test 2 Passed: Watermark');
}

// Test 3: Default Jurisdiction Fallback
{
  const weirdFormData = { ...formData, jurisdiction: 'XX' }; // Invalid state
  const doc = generatePdfDefinition(weirdFormData, calculatedValues, tone);

  // Should use DEFAULT clause
  // "Unless you dispute the validity of this debt" is in DEFAULT clause
  const hasDefaultClause = JSON.stringify(doc).includes('Unless you dispute the validity of this debt');
  assert.ok(hasDefaultClause, 'PDF should fallback to default disclosure');
  console.log('Test 3 Passed: Jurisdiction Fallback');
}

console.log('All tests finished.');
