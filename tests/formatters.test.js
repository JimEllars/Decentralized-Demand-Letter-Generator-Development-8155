
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
  });

  it('should format zero correctly', () => {
    assert.strictEqual(formatCurrency(0), '$0.00');
    assert.strictEqual(formatCurrency('0'), '$0.00');
  });

  it('should handle NaN, null, and undefined by returning $0.00', () => {
    assert.strictEqual(formatCurrency(NaN), '$0.00');
    assert.strictEqual(formatCurrency(null), '$0.00');
    assert.strictEqual(formatCurrency(undefined), '$0.00');
  });

  it('should handle non-numeric strings by returning $0.00', () => {
    assert.strictEqual(formatCurrency('abc'), '$0.00');
    assert.strictEqual(formatCurrency(''), '$0.00');
  });
});
