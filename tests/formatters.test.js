
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
