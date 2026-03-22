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

  it('STRIPE_PUBLISHABLE_KEY should be a string or null', () => {
    const key = constants.STRIPE_PUBLISHABLE_KEY;
    const isStringOrNull = typeof key === 'string' || key === null;
    assert.ok(isStringOrNull, 'STRIPE_PUBLISHABLE_KEY should be string or null');
  });
});
