import { test, describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { generatePdfDefinition } from '../src/services/pdfGenerator.js';

describe('pdfGenerator', () => {
  const baseCalculatedValues = {
    formattedTotal: '$1,000.00',
    formattedInterest: '$50.00',
    rateUsed: 5,
    statuteUsed: 'Statute 123'
  };

  const baseTone = {
    title: 'Demand Letter',
    intro: 'This is an intro.',
    closing: 'This is a closing.'
  };

  const baseFormData = {
    creditorName: 'John Doe',
    creditorAddress: '123 Main St',
    debtorName: 'Jane Smith',
    debtorAddress: '456 Elm St',
    jurisdiction: 'DEFAULT',
    items: [],
    letterDate: '2024-01-01',
    dueDate: '2024-01-15'
  };

  it('generatePdfDefinition should return a valid document definition', () => {
    const docDef = generatePdfDefinition(baseFormData, baseCalculatedValues, baseTone);
    assert.strictEqual(docDef.content[0].text, 'Demand Letter');
    // Check letter date formatting (header section)
    const columns = docDef.content.find(item => item.columns);
    const dateStack = columns.columns[1].stack;
    assert.strictEqual(dateStack[1].text, '1/1/2024');

    // Check due date formatting (closing section)
    const dueDateText = docDef.content.find(item => typeof item.text === 'string' && item.text.includes('Payment must be received by'));
    assert.ok(dueDateText.text.includes('1/15/2024'));
  });

  it('formatDate helper should handle missing date by returning current date', () => {
    const formData = { ...baseFormData, letterDate: null, dueDate: undefined };
    const docDef = generatePdfDefinition(formData, baseCalculatedValues, baseTone);

    // Check letter date (should be current date, format depends on locale but it should not be empty or throw)
    const columns = docDef.content.find(item => item.columns);
    const dateStack = columns.columns[1].stack;
    assert.ok(dateStack[1].text.length > 0);
    assert.notStrictEqual(dateStack[1].text, 'Invalid Date');

    // Check due date
    const dueDateText = docDef.content.find(item => typeof item.text === 'string' && item.text.includes('Payment must be received by'));
    assert.ok(dueDateText.text.length > 0);
    assert.ok(!dueDateText.text.includes('Invalid Date'));
  });

  it('formatDate helper should return "Invalid Date" for malformed date string', () => {
    const formData = { ...baseFormData, letterDate: 'invalid-date', dueDate: 'bad-format' };
    const docDef = generatePdfDefinition(formData, baseCalculatedValues, baseTone);

    // Check letter date
    const columns = docDef.content.find(item => item.columns);
    const dateStack = columns.columns[1].stack;
    assert.strictEqual(dateStack[1].text, 'Invalid Date');

    // Check due date
    const dueDateText = docDef.content.find(item => typeof item.text === 'string' && item.text.includes('Payment must be received by'));
    assert.ok(dueDateText.text.includes('Invalid Date'));
  });
});
