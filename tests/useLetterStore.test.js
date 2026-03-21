import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { renderHook, act } from '@testing-library/react';
import { useLetterStore } from '../src/hooks/useLetterStore';

const STORAGE_KEY = 'axim_demand_letter_draft_v2';

describe('useLetterStore removeItem edge cases', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.removeItem(STORAGE_KEY);
  });

  test('removeItem gracefully handles missing items array', () => {
    const initialState = { otherField: 'test' }; // No items array
    const { result } = renderHook(() => useLetterStore(initialState));

    act(() => {
      result.current.removeItem(0);
    });

    // Should create an empty items array rather than crashing when items is undefined
    assert.deepStrictEqual(result.current.formData.items, []);
  });

  test('removeItem removes correctly by index', () => {
    const initialState = {
      items: [
        { id: '1', description: 'Item 1' },
        { id: '2', description: 'Item 2' },
        { id: '3', description: 'Item 3' }
      ]
    };
    const { result } = renderHook(() => useLetterStore(initialState));

    act(() => {
      result.current.removeItem(1); // Remove 'Item 2'
    });

    assert.strictEqual(result.current.formData.items.length, 2);
    assert.strictEqual(result.current.formData.items[0].id, '1');
    assert.strictEqual(result.current.formData.items[1].id, '3');
  });

  test('removeItem does not mutate original array when index is out of bounds', () => {
    const initialState = {
      items: [
        { id: '1', description: 'Item 1' }
      ]
    };
    const { result } = renderHook(() => useLetterStore(initialState));

    act(() => {
      result.current.removeItem(5); // Out of bounds
    });

    assert.strictEqual(result.current.formData.items.length, 1);
    assert.strictEqual(result.current.formData.items[0].id, '1');
  });

  test('removeItem handles empty array without error', () => {
    const initialState = { items: [] };
    const { result } = renderHook(() => useLetterStore(initialState));

    act(() => {
      result.current.removeItem(0);
    });

    assert.strictEqual(result.current.formData.items.length, 0);
  });
});

describe('useLetterStore addItem', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  test('addItem creates items array if missing', () => {
    const initialState = { otherField: 'test' }; // No items array
    const { result } = renderHook(() => useLetterStore(initialState));

    act(() => {
      result.current.addItem();
    });

    assert.strictEqual(result.current.formData.items.length, 1);
    assert.ok(result.current.formData.items[0].id); // ID should be generated
    assert.strictEqual(result.current.formData.items[0].description, '');
    assert.strictEqual(result.current.formData.items[0].amount, '');
  });

  test('addItem appends to existing array', () => {
    const initialState = {
      items: [{ id: '1', description: 'Item 1', amount: '100' }]
    };
    const { result } = renderHook(() => useLetterStore(initialState));

    act(() => {
      result.current.addItem();
    });

    assert.strictEqual(result.current.formData.items.length, 2);
    assert.strictEqual(result.current.formData.items[0].id, '1');
    assert.ok(result.current.formData.items[1].id);
  });
});
