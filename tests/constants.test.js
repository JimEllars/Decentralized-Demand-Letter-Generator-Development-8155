import { test, describe, it } from 'node:test';
import assert from 'node:assert';
import * as constants from '../src/utils/constants.js';

describe('constants', () => {
  it('STATE_NAMES should be an object with 51 valid entries', () => {
    assert.strictEqual(typeof constants.STATE_NAMES, 'object');
    assert.strictEqual(Object.keys(constants.STATE_NAMES).length, 51);
    assert.strictEqual(constants.STATE_NAMES['CA'], 'California');
    assert.strictEqual(constants.STATE_NAMES['NY'], 'New York');

    for (const [key, value] of Object.entries(constants.STATE_NAMES)) {
      // Keys should be exactly 2 uppercase letters
      assert.match(key, /^[A-Z]{2}$/);
      // Values should be strings containing alphabetic characters and optional spaces
      assert.strictEqual(typeof value, 'string');
      assert.ok(value.length > 0);
      assert.match(value, /^[A-Za-z\s]+$/);
    }
  });

  it('STATE_LEGAL_DETAILS should contain all states plus DEFAULT', () => {
    assert.strictEqual(typeof constants.STATE_LEGAL_DETAILS, 'object');
    const keys = Object.keys(constants.STATE_LEGAL_DETAILS);
    const stateKeys = Object.keys(constants.STATE_NAMES);

    stateKeys.forEach(state => {
      assert.ok(keys.includes(state), `Missing legal details for ${state}`);
      assert.strictEqual(typeof constants.STATE_LEGAL_DETAILS[state].rate, 'number');
      assert.strictEqual(typeof constants.STATE_LEGAL_DETAILS[state].statute, 'string');
    });

    assert.ok(keys.includes('DEFAULT'));
    assert.strictEqual(typeof constants.STATE_LEGAL_DETAILS['DEFAULT'].rate, 'number');
    assert.strictEqual(typeof constants.STATE_LEGAL_DETAILS['DEFAULT'].statute, 'string');
  });

  it('TONE_TEMPLATES should contain 4 valid tones', () => {
    const expectedTones = ['soft', 'firm', 'aggressive', 'professional'];
    assert.strictEqual(typeof constants.TONE_TEMPLATES, 'object');

    expectedTones.forEach(tone => {
      assert.ok(constants.TONE_TEMPLATES[tone], `Missing tone template: ${tone}`);
      assert.strictEqual(typeof constants.TONE_TEMPLATES[tone].title, 'string');
      assert.strictEqual(typeof constants.TONE_TEMPLATES[tone].intro, 'string');
      assert.strictEqual(typeof constants.TONE_TEMPLATES[tone].closing, 'string');
    });
  });

  it('STATE_SPECIFIC_CLAUSES should contain expected keys and have valid structure', () => {
    const expectedKeys = ['CA', 'NY', 'TX', 'CO', 'MA', 'MN', 'FL', 'NC', 'DEFAULT'];
    assert.strictEqual(typeof constants.STATE_SPECIFIC_CLAUSES, 'object');

    expectedKeys.forEach(key => {
      assert.ok(constants.STATE_SPECIFIC_CLAUSES[key], `Missing state clause: ${key}`);
      assert.strictEqual(typeof constants.STATE_SPECIFIC_CLAUSES[key].label, 'string');
      assert.strictEqual(typeof constants.STATE_SPECIFIC_CLAUSES[key].text, 'string');
    });
  });

  it('STATE_OPTIONS should be a sorted array of 51 state objects', () => {
    assert.ok(Array.isArray(constants.STATE_OPTIONS));
    assert.strictEqual(constants.STATE_OPTIONS.length, 51);

    // Verify structure of first element
    assert.strictEqual(typeof constants.STATE_OPTIONS[0].code, 'string');
    assert.strictEqual(typeof constants.STATE_OPTIONS[0].name, 'string');
    assert.match(constants.STATE_OPTIONS[0].code, /^[A-Z]{2}$/);

    // Verify alphabetical sorting by state name
    for (let i = 0; i < constants.STATE_OPTIONS.length - 1; i++) {
      const current = constants.STATE_OPTIONS[i].name;
      const next = constants.STATE_OPTIONS[i + 1].name;
      assert.ok(current.localeCompare(next) <= 0, `STATE_OPTIONS is not sorted: ${current} vs ${next}`);
    }

    // Verify some specific entries
    const california = constants.STATE_OPTIONS.find(s => s.code === 'CA');
    assert.ok(california);
    assert.strictEqual(california.name, 'California (10%)');

    const florida = constants.STATE_OPTIONS.find(s => s.code === 'FL');
    assert.ok(florida);
    assert.strictEqual(florida.name, 'Florida (4.75%)');
  });

  it('STATE_OPTIONS should be in sync with STATE_NAMES and STATE_LEGAL_DETAILS', () => {
    // Dynamically compute what the options should be
    const expectedOptions = Object.keys(constants.STATE_NAMES)
      .sort((a, b) => constants.STATE_NAMES[a].localeCompare(constants.STATE_NAMES[b]))
      .map(code => ({
        code,
        name: `${constants.STATE_NAMES[code]} (${constants.STATE_LEGAL_DETAILS[code]?.rate}%)`
      }));

    // Deep equality check
    assert.strictEqual(constants.STATE_OPTIONS.length, expectedOptions.length);

    expectedOptions.forEach((expected, index) => {
      const actual = constants.STATE_OPTIONS[index];
      assert.strictEqual(actual.code, expected.code, `Mismatch at index ${index}: expected code ${expected.code}, got ${actual.code}`);
      assert.strictEqual(actual.name, expected.name, `Mismatch at index ${index}: expected name ${expected.name}, got ${actual.name}`);
    });
  });
});
