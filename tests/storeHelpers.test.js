import { describe, it } from 'node:test';
import assert from 'node:assert';
import { loadAndMigrateData } from '../src/utils/storeHelpers.js';

describe('storeHelpers', () => {
  const initialData = {
    creditorName: 'Initial Creditor',
    items: []
  };

  it('loadAndMigrateData should return initialData when saved is null', () => {
    const result = loadAndMigrateData(null, initialData);
    assert.deepStrictEqual(result, initialData);
  });

  it('loadAndMigrateData should return initialData when saved is empty string', () => {
    const result = loadAndMigrateData('', initialData);
    assert.deepStrictEqual(result, initialData);
  });

  it('loadAndMigrateData should parse valid JSON', () => {
    const validJson = JSON.stringify({ creditorName: 'Saved Creditor', items: [] });
    const result = loadAndMigrateData(validJson, initialData);
    assert.strictEqual(result.creditorName, 'Saved Creditor');
  });

  it('loadAndMigrateData should handle invalid JSON gracefully', () => {
    const invalidJson = '{ invalid json }';
    const result = loadAndMigrateData(invalidJson, initialData);
    assert.deepStrictEqual(result, initialData);
  });

  it('loadAndMigrateData should migrate items missing IDs', () => {
    const dataWithoutIds = JSON.stringify({
      items: [{ description: 'Item 1', amount: '100' }]
    });
    const result = loadAndMigrateData(dataWithoutIds, initialData);
    assert.strictEqual(result.items.length, 1);
    assert.ok(result.items[0].id, 'Item should have a generated ID');
    assert.strictEqual(result.items[0].description, 'Item 1');
  });

  it('loadAndMigrateData should preserve existing item IDs', () => {
    const dataWithIds = JSON.stringify({
      items: [{ id: 'existing-id', description: 'Item 1', amount: '100' }]
    });
    const result = loadAndMigrateData(dataWithIds, initialData);
    assert.strictEqual(result.items[0].id, 'existing-id');
  });

  it('loadAndMigrateData should support functional initialData', () => {
    const initialFn = () => ({ creditorName: 'From Fn', items: [] });
    const result = loadAndMigrateData(null, initialFn);
    assert.strictEqual(result.creditorName, 'From Fn');
  });
});
