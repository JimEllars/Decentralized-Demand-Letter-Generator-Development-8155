
import { test, describe, it } from 'node:test';
import assert from 'node:assert';
import { validateForm, getFirstErrorFieldId, sanitizeInput, sanitizeFormData } from '../src/utils/validation.js';

describe('sanitizeInput', () => {
  it('should strip HTML tags', () => {
    assert.strictEqual(sanitizeInput('<b>bold</b>'), 'bold');
    assert.strictEqual(sanitizeInput('<script>alert("x")</script>hello'), 'alert("x")hello');
  });

  it('should strip non-standard special characters', () => {
    assert.strictEqual(sanitizeInput('hello {world} | test < > ='), 'hello world  test');
  });

  it('should trim whitespace', () => {
    assert.strictEqual(sanitizeInput('  hello  '), 'hello');
  });

  it('should handle non-strings gracefully', () => {
    assert.strictEqual(sanitizeInput(null), null);
    assert.strictEqual(sanitizeInput(123), 123);
  });
});

describe('sanitizeFormData', () => {
  it('should sanitize all string fields in form data', () => {
    const rawData = {
      creditorName: '<b>John</b>',
      creditorAddress: '123 Main St {Apt 1}',
      debtorName: '<script>Doe</script>',
      debtorAddress: '456 Oak St | Suite 2',
      items: [
        { description: 'Service <i>1</i>', amount: '100' }
      ]
    };

    const sanitized = sanitizeFormData(rawData);

    assert.strictEqual(sanitized.creditorName, 'John');
    assert.strictEqual(sanitized.creditorAddress, '123 Main St Apt 1');
    assert.strictEqual(sanitized.debtorName, 'Doe');
    assert.strictEqual(sanitized.debtorAddress, '456 Oak St  Suite 2');
    assert.strictEqual(sanitized.items[0].description, 'Service 1');
    assert.strictEqual(sanitized.items[0].amount, '100'); // amount untouched
  });

  it('should handle empty or null form data', () => {
    assert.strictEqual(sanitizeFormData(null), null);
    assert.strictEqual(sanitizeFormData(undefined), undefined);
  });
});

describe('validateForm', () => {
  it('should return valid if all fields are filled properly', () => {
    const validForm = {
      creditorName: 'Creditor',
      creditorAddress: 'Address 1',
      debtorName: 'Debtor',
      debtorAddress: 'Address 2',
      dueDate: '2023-01-01',
      letterDate: '2023-01-01',
      items: [{ description: 'Item', amount: '100' }]
    };
    const result = validateForm(validForm);
    assert.strictEqual(result.isValid, true);
    assert.deepStrictEqual(result.errors, {});
  });

  it('should return invalid if required fields are missing', () => {
    const invalidForm = {
      creditorName: '',
      creditorAddress: 'Address 1',
      debtorName: '',
      debtorAddress: '',
      dueDate: '',
      letterDate: '',
      items: []
    };
    const result = validateForm(invalidForm);
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.creditorName);
    assert.ok(result.errors.debtorName);
    assert.ok(result.errors.debtorAddress);
    assert.ok(result.errors.dueDate);
    assert.ok(result.errors.letterDate);
    assert.ok(result.errors.items);
  });

  it('should invalidate strings over length limits', () => {
    const longString101 = 'a'.repeat(101);
    const longString501 = 'a'.repeat(501);

    const invalidForm = {
      creditorName: longString101,
      creditorAddress: longString501,
      debtorName: longString101,
      debtorAddress: longString501,
      dueDate: '2023-01-01',
      letterDate: '2023-01-01',
      items: [{ description: longString501, amount: '100' }]
    };

    const result = validateForm(invalidForm);
    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.errors.creditorName, "Creditor Name must be 100 characters or less.");
    assert.strictEqual(result.errors.creditorAddress, "Creditor Address must be 500 characters or less.");
    assert.strictEqual(result.errors.debtorName, "Debtor Name must be 100 characters or less.");
    assert.strictEqual(result.errors.debtorAddress, "Debtor Address must be 500 characters or less.");
    assert.strictEqual(result.errors.itemErrors[0].errors.description, "Description must be 500 characters or less.");
  });

  it('should invalidate empty items array', () => {
    const form = {
      creditorName: 'Creditor',
      creditorAddress: 'Address 1',
      debtorName: 'Debtor',
      debtorAddress: 'Address 2',
      dueDate: '2023-01-01',
      letterDate: '2023-01-01',
      items: []
    };
    const result = validateForm(form);
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.items);
  });

  it('should invalidate items with zero amount', () => {
    const form = {
      creditorName: 'Creditor',
      creditorAddress: 'Address 1',
      debtorName: 'Debtor',
      debtorAddress: 'Address 2',
      dueDate: '2023-01-01',
      letterDate: '2023-01-01',
      items: [{ description: 'Item', amount: '0' }]
    };
    const result = validateForm(form);
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.itemErrors);
    assert.strictEqual(result.errors.itemErrors[0].index, 0);
    assert.ok(result.errors.itemErrors[0].errors.amount);
  });

  it('should invalidate items with missing description', () => {
    const form = {
      creditorName: 'Creditor',
      creditorAddress: 'Address 1',
      debtorName: 'Debtor',
      debtorAddress: 'Address 2',
      dueDate: '2023-01-01',
      letterDate: '2023-01-01',
      items: [{ description: '', amount: '100' }]
    };
    const result = validateForm(form);
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.itemErrors);
    assert.strictEqual(result.errors.itemErrors[0].index, 0);
    assert.ok(result.errors.itemErrors[0].errors.description);
  });
});

describe('getFirstErrorFieldId', () => {
  it('should return creditorName if it is the first error', () => {
    const errors = { creditorName: 'Error', dueDate: 'Error' };
    assert.strictEqual(getFirstErrorFieldId(errors), 'creditorName');
  });

  it('should return creditorAddress if it is the first error', () => {
    const errors = { creditorAddress: 'Error', dueDate: 'Error' };
    assert.strictEqual(getFirstErrorFieldId(errors), 'creditorAddress');
  });

  it('should return debtorName if it is the first error', () => {
    const errors = { debtorName: 'Error', dueDate: 'Error' };
    assert.strictEqual(getFirstErrorFieldId(errors), 'debtorName');
  });

  it('should return debtorAddress if it is the first error', () => {
    const errors = { debtorAddress: 'Error', dueDate: 'Error' };
    assert.strictEqual(getFirstErrorFieldId(errors), 'debtorAddress');
  });

  it('should return dueDate if it is the first error', () => {
    const errors = { dueDate: 'Error', letterDate: 'Error' };
    assert.strictEqual(getFirstErrorFieldId(errors), 'dueDate');
  });

  it('should return letterDate if it is the first error', () => {
    const errors = { letterDate: 'Error', items: 'Error' };
    assert.strictEqual(getFirstErrorFieldId(errors), 'letterDate');
  });

  it('should return items-section if items has an error', () => {
    const errors = { items: 'Error' };
    assert.strictEqual(getFirstErrorFieldId(errors), 'items-section');
  });

  it('should return items-section if itemErrors has an error', () => {
    const errors = { itemErrors: [{ index: 0, errors: { description: 'Error' } }] };
    assert.strictEqual(getFirstErrorFieldId(errors), 'items-section');
  });

  it('should return null if there are no errors', () => {
    const errors = {};
    assert.strictEqual(getFirstErrorFieldId(errors), null);
  });
});
