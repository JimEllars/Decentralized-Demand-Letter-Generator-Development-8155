
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatCurrency } from '../src/utils/formatters.js';

describe('formatCurrency', () => {
  it('should format positive numbers correctly', () => {
    assert.strictEqual(formatCurrency(100), '$100.00');
    assert.strictEqual(formatCurrency(1234.56), '$1,234.56');
    assert.strictEqual(formatCurrency(0.5), '$0.50');
  });

  it('should format numeric strings correctly', () => {
    assert.strictEqual(formatCurrency('100'), '$100.00');
    assert.strictEqual(formatCurrency('1234.56'), '$1,234.56');
  });

  it('should format negative numbers correctly', () => {
    // Note: The minus sign might be different depending on the locale,
    // but en-US usually uses the standard hyphen-minus or a specialized minus character.
    // Given the simple setup, standard hyphen-minus is expected.
    assert.strictEqual(formatCurrency(-100), '-$100.00');
    assert.strictEqual(formatCurrency('-100'), '-$100.00');
    assert.strictEqual(formatCurrency('-1234.56'), '-$1,234.56');
  });

  it('should format zero correctly', () => {
    assert.strictEqual(formatCurrency(0), '$0.00');
    assert.strictEqual(formatCurrency('0'), '$0.00');
    assert.strictEqual(formatCurrency(-0), '-$0.00');
  });

  it('should handle strings with trailing non-numeric characters (via parseFloat)', () => {
    assert.strictEqual(formatCurrency('12.34abc'), '$12.34');
    assert.strictEqual(formatCurrency('100.00 USD'), '$100.00');
  });

  it('should handle whitespace padded strings correctly', () => {
    assert.strictEqual(formatCurrency('  123  '), '$123.00');
    assert.strictEqual(formatCurrency('\n456.78\t'), '$456.78');
  });

  it('should format extremely large numbers correctly', () => {
    assert.strictEqual(formatCurrency(1000000000), '$1,000,000,000.00');
    assert.strictEqual(formatCurrency('1000000000'), '$1,000,000,000.00');
  });

  it('should handle NaN, null, and undefined by returning $0.00', () => {
    assert.strictEqual(formatCurrency(NaN), '$0.00');
    assert.strictEqual(formatCurrency(null), '$0.00');
    assert.strictEqual(formatCurrency(undefined), '$0.00');
  });

  it('should handle boolean types as numbers', () => {
    // true -> 1, false -> 0 due to loose numeric conversion where isNaN(true) is false
    assert.strictEqual(formatCurrency(true), '$1.00');
    assert.strictEqual(formatCurrency(false), '$0.00');
  });

  it('should handle objects and arrays by returning $0.00', () => {
    assert.strictEqual(formatCurrency({}), '$0.00');
    assert.strictEqual(formatCurrency([]), '$0.00');
    assert.strictEqual(formatCurrency([1, 2]), '$0.00');
  });

  it('should handle non-numeric strings by returning $0.00', () => {
    assert.strictEqual(formatCurrency('abc'), '$0.00');
    assert.strictEqual(formatCurrency(''), '$0.00');
  });
});

describe('formatFriendlyDate', () => {
  // Simulating formatFriendlyDate as it is currently only present in worker.js
  const formatFriendlyDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
    }
    return dateStr;
  };

  it('should format a valid date string YYYY-MM-DD', () => {
    assert.strictEqual(formatFriendlyDate('2026-03-31'), 'March 31, 2026');
    assert.strictEqual(formatFriendlyDate('2023-01-01'), 'January 1, 2023');
    assert.strictEqual(formatFriendlyDate('1999-12-31'), 'December 31, 1999');
  });

  it('should fallback to the original string if malformed', () => {
    assert.strictEqual(formatFriendlyDate('invalid-date'), 'invalid-date');
    assert.strictEqual(formatFriendlyDate('2026/03/31'), '2026/03/31');
    assert.strictEqual(formatFriendlyDate('March 31, 2026'), 'March 31, 2026');
  });

  it('should return empty string on falsy values', () => {
    assert.strictEqual(formatFriendlyDate(''), '');
    assert.strictEqual(formatFriendlyDate(null), '');
    assert.strictEqual(formatFriendlyDate(undefined), '');
  });
});
