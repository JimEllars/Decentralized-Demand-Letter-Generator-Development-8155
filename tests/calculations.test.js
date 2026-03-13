
import { test, describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateTotal, getToneTemplate } from '../src/utils/calculations.js';

describe('calculateTotal', () => {
  it('should calculate principal correctly', () => {
    const items = [
      { amount: '100' },
      { amount: '200.50' }
    ];
    const result = calculateTotal(items, 0, '2023-01-01', 'DEFAULT', '2023-01-01');
    assert.strictEqual(result.principal, 300.5);
    assert.strictEqual(result.formattedPrincipal, '$300.50');
  });

  it('should calculate interest correctly for DEFAULT jurisdiction (6%)', () => {
    // Principal 1000, 6% rate, 365 days -> 60 interest
    const items = [{ amount: '1000' }];
    const dueDate = '2022-01-01';
    const letterDate = '2023-01-01'; // 365 days later
    const result = calculateTotal(items, 0, dueDate, 'DEFAULT', letterDate);

    assert.strictEqual(result.principal, 1000);
    // Simple interest: 1000 * 0.06 * (365/365) = 60
    // But calculateTotal uses differenceInCalendarDays which might be slightly off due to leap years depending on implementation
    // 2022 is not leap, 365 days.
    assert.strictEqual(Math.round(result.interest), 60);
    assert.strictEqual(result.rateUsed, '6.00');
  });

  it('should use custom interest rate when provided', () => {
    const items = [{ amount: '1000' }];
    const dueDate = '2022-01-01';
    const letterDate = '2023-01-01';
    const customRate = 10;
    const result = calculateTotal(items, customRate, dueDate, 'DEFAULT', letterDate);

    // 1000 * 0.10 * 1 = 100
    assert.strictEqual(Math.round(result.interest), 100);
    assert.strictEqual(result.rateUsed, '10.00');
    assert.match(result.statuteUsed, /Custom Agreed Rate/);
  });

  it('should handle zero interest if no days overdue', () => {
    const items = [{ amount: '1000' }];
    const dueDate = '2023-01-01';
    const letterDate = '2023-01-01'; // Same day
    const result = calculateTotal(items, 0, dueDate, 'DEFAULT', letterDate);

    assert.strictEqual(result.interest, 0);
    assert.strictEqual(result.daysOverdue, 0);
  });

  it('should handle negative days overdue (future due date) as zero interest', () => {
    const items = [{ amount: '1000' }];
    const dueDate = '2023-02-01';
    const letterDate = '2023-01-01'; // Before due date
    const result = calculateTotal(items, 0, dueDate, 'DEFAULT', letterDate);

    assert.strictEqual(result.interest, 0);
    assert.strictEqual(result.daysOverdue, 0); // Or negative depending on implementation, but logic says diff > 0 check
  });

  it('should handle state-specific rates', () => {
    // CA rate is 10%
    const items = [{ amount: '1000' }];
    const dueDate = '2022-01-01';
    const letterDate = '2023-01-01';
    const result = calculateTotal(items, 0, dueDate, 'CA', letterDate);

    // 1000 * 0.10 * 1 = 100
    assert.strictEqual(Math.round(result.interest), 100);
    assert.strictEqual(result.rateUsed, '10.00');
  });

  it('should fallback to DEFAULT jurisdiction when an invalid jurisdiction is provided', () => {
    // DEFAULT rate is 6%
    const items = [{ amount: '1000' }];
    const dueDate = '2022-01-01';
    const letterDate = '2023-01-01';
    const result = calculateTotal(items, 0, dueDate, 'INVALID_STATE', letterDate);

    // 1000 * 0.06 * 1 = 60
    assert.strictEqual(Math.round(result.interest), 60);
    assert.strictEqual(result.rateUsed, '6.00');

    // Explicitly test another invalid string as requested
    const resultUnknown = calculateTotal(items, 0, dueDate, 'UNKNOWN_STATE', letterDate);
    assert.strictEqual(Math.round(resultUnknown.interest), 60);
    assert.strictEqual(resultUnknown.rateUsed, '6.00');
  });

  it('should fallback to DEFAULT jurisdiction when jurisdiction is null or undefined', () => {
    const items = [{ amount: '1000' }];
    const dueDate = '2022-01-01';
    const letterDate = '2023-01-01';

    const resultNull = calculateTotal(items, 0, dueDate, null, letterDate);
    assert.strictEqual(Math.round(resultNull.interest), 60);
    assert.strictEqual(resultNull.rateUsed, '6.00');

    const resultUndefined = calculateTotal(items, 0, dueDate, undefined, letterDate);
    assert.strictEqual(Math.round(resultUndefined.interest), 60);
    assert.strictEqual(resultUndefined.rateUsed, '6.00');
  });

  it('should handle empty items array', () => {
    const result = calculateTotal([], 0, '2023-01-01');
    assert.strictEqual(result.principal, 0);
    assert.strictEqual(result.total, 0);
  });
});

describe('getToneTemplate', () => {
  it('should return the correct template for a valid tone', () => {
    const template = getToneTemplate('professional');
    assert.ok(template);
    // Since it returns an object with title, intro, and closing, we should assert its properties.
    assert.strictEqual(typeof template, 'object');
    assert.ok(template.title);
    assert.ok(template.intro);
    assert.ok(template.closing);
  });

  it('should fallback to firm template for an invalid tone', () => {
    const template = getToneTemplate('invalid_tone');
    const firmTemplate = getToneTemplate('firm');
    assert.strictEqual(template, firmTemplate);
  });

  it('should fallback to firm template for null or undefined tone', () => {
    const templateNull = getToneTemplate(null);
    const firmTemplate = getToneTemplate('firm');
    assert.strictEqual(templateNull, firmTemplate);

    const templateUndefined = getToneTemplate(undefined);
    assert.strictEqual(templateUndefined, firmTemplate);
  });
});
