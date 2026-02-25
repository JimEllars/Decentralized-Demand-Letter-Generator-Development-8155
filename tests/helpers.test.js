
import { test, describe, it } from 'node:test';
import assert from 'node:assert';
import { generateId, getLocalDateString } from '../src/utils/helpers.js';

describe('helpers', () => {
  it('generateId should return a string', () => {
    const id = generateId();
    assert.strictEqual(typeof id, 'string');
    assert.ok(id.length > 0);
  });

  it('generateId should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    assert.notStrictEqual(id1, id2);
  });

  it('getLocalDateString should return YYYY-MM-DD format', () => {
    const dateStr = getLocalDateString();
    assert.match(dateStr, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('getLocalDateString should format specific date correctly', () => {
    // Note: Month is 0-indexed in JS Date constructor
    const date = new Date(2023, 0, 15); // Jan 15 2023
    const dateStr = getLocalDateString(date);
    assert.strictEqual(dateStr, '2023-01-15');
  });
});
