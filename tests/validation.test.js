
import { test, describe, it } from 'node:test';
import assert from 'node:assert';
import { validateForm, getFirstErrorFieldId } from '../src/utils/validation.js';

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
    const errors = { itemErrors: [{ index: 0, message: 'Error' }] };
    assert.strictEqual(getFirstErrorFieldId(errors), 'items-section');
  });

  it('should return null if there are no errors', () => {
    const errors = {};
    assert.strictEqual(getFirstErrorFieldId(errors), null);
  });
});
