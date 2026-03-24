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

  it('generatePdfDefinition should add a watermark when options.watermark is true', () => {
    const docDef = generatePdfDefinition(baseFormData, baseCalculatedValues, baseTone, { watermark: true });
    assert.ok(docDef.watermark);
    assert.strictEqual(docDef.watermark.text, 'PREVIEW - NOT FOR USE');
  });

  it('generatePdfDefinition should not add a watermark when options.watermark is false or undefined', () => {
    const docDef1 = generatePdfDefinition(baseFormData, baseCalculatedValues, baseTone);
    assert.strictEqual(docDef1.watermark, undefined);

    const docDef2 = generatePdfDefinition(baseFormData, baseCalculatedValues, baseTone, { watermark: false });
    assert.strictEqual(docDef2.watermark, undefined);
  });

  it('generatePdfDefinition should include specific state legal disclosure based on jurisdiction', () => {
    const formData = { ...baseFormData, jurisdiction: 'CA' };
    const docDef = generatePdfDefinition(formData, baseCalculatedValues, baseTone);

    // Look for the California Disclosure label
    const hasCADisclosure = docDef.content.some(item => typeof item.text === 'string' && item.text === 'CALIFORNIA DISCLOSURE');
    assert.ok(hasCADisclosure, 'Missing California Disclosure label');
  });

  it('generatePdfDefinition should use DEFAULT legal disclosure for unknown jurisdiction', () => {
    const formData = { ...baseFormData, jurisdiction: 'UNKNOWN_STATE' };
    const docDef = generatePdfDefinition(formData, baseCalculatedValues, baseTone);

    // Look for the Default Disclosure label
    const hasDefaultDisclosure = docDef.content.some(item => typeof item.text === 'string' && item.text === 'DEBT COLLECTION NOTICE');
    assert.ok(hasDefaultDisclosure, 'Missing Default Disclosure label for unknown jurisdiction');
  });

  it('generatePdfDefinition should fallback to applicable law if statuteUsed is missing', () => {
    const calculatedValues = { ...baseCalculatedValues, statuteUsed: undefined };
    const docDef = generatePdfDefinition(baseFormData, calculatedValues, baseTone);

    const statuteText = docDef.content.find(item => typeof item.text === 'string' && item.text.includes('pursuant to applicable law'));
    assert.ok(statuteText, 'Missing fallback to applicable law');
  });

  it('generatePdfDefinition should handle missing items array gracefully', () => {
    const formData = { ...baseFormData, items: null };
    const docDef = generatePdfDefinition(formData, baseCalculatedValues, baseTone);

    // The table should still render, with just header, interest, and total rows
    const tableDef = docDef.content.find(item => item.table);
    assert.ok(tableDef);
    assert.strictEqual(tableDef.table.body.length, 3); // header + statutory interest + total due
  });

  it('generatePdfDefinition should handle item mapping defaults for missing description and amount', () => {
    const formData = {
      ...baseFormData,
      items: [
        { description: 'Consulting Fee', amount: '500' },
        { description: '', amount: '250' },
        { description: 'Misc', amount: '' },
        {} // completely empty item
      ]
    };
    const docDef = generatePdfDefinition(formData, baseCalculatedValues, baseTone);

    const tableDef = docDef.content.find(item => item.table);
    assert.ok(tableDef);

    // Rows: header (1), items (4), interest (1), total (1) = 7 rows
    assert.strictEqual(tableDef.table.body.length, 7);

    // Item 1
    assert.strictEqual(tableDef.table.body[1][0], 'Consulting Fee');
    assert.strictEqual(tableDef.table.body[1][1], '$500.00');

    // Item 2 (missing description)
    assert.strictEqual(tableDef.table.body[2][0], 'Item');
    assert.strictEqual(tableDef.table.body[2][1], '$250.00');

    // Item 3 (missing amount)
    assert.strictEqual(tableDef.table.body[3][0], 'Misc');
    assert.strictEqual(tableDef.table.body[3][1], '$0.00');

    // Item 4 (missing both)
    assert.strictEqual(tableDef.table.body[4][0], 'Item');
    assert.strictEqual(tableDef.table.body[4][1], '$0.00');
  });
});
