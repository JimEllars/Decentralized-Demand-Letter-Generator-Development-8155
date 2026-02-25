
import { test, describe, it } from 'node:test';
import assert from 'node:assert';
import { validateForm } from '../src/utils/validation.js';

describe('validateForm', () => {
  it('should return valid if all fields are filled', () => {
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
  });
});
