import { test, describe, it, mock, afterEach, beforeEach } from 'node:test';
import assert from 'node:assert';
import { renderHook, act, cleanup, waitFor } from '@testing-library/react';
import { useLetterStore } from '../src/hooks/useLetterStore.js';

describe('useLetterStore', () => {
  let originalLocalStorage;

  beforeEach(() => {
    if (globalThis.window) {
      if (globalThis.window.localStorage) {
        globalThis.window.localStorage.clear();
      }
    }
  });

  afterEach(() => {
    cleanup();
    mock.restoreAll();
  });

  it('initializes with initialData if localStorage is empty', () => {
    const { result, unmount } = renderHook(() => useLetterStore({ test: 'initial' }));

    assert.strictEqual(result.current.formData.test, 'initial');
    assert.strictEqual(result.current.isInitialized, true);

    unmount();
  });

  it('initializes gracefully when localStorage contains invalid JSON', () => {
    // Mock localStorage to return invalid JSON
    globalThis.window.localStorage.setItem('axim_demand_letter_draft_v2', '{invalid_json}');

    const { result, unmount } = renderHook(() => useLetterStore({ test: 'fallback' }));

    // Should fallback to initial data gracefully
    assert.strictEqual(result.current.formData.test, 'fallback');
    assert.strictEqual(result.current.isInitialized, true);

    unmount();
  });

  it('initializes from valid JSON in localStorage', () => {
    const validData = { test: 'saved_value', items: [] };
    globalThis.window.localStorage.setItem('axim_demand_letter_draft_v2', JSON.stringify(validData));

    const { result, unmount } = renderHook(() => useLetterStore({ test: 'fallback' }));

    assert.strictEqual(result.current.formData.test, 'saved_value');

    unmount();
  });

  it('updates a field correctly', async () => {
    const { result, unmount } = renderHook(() => useLetterStore({ field1: 'value1' }));

    act(() => {
      result.current.updateField('field1', 'new_value');
    });

    assert.strictEqual(result.current.formData.field1, 'new_value');

    unmount();
  });

  it('updates a field using a functional update', async () => {
    const { result, unmount } = renderHook(() => useLetterStore({ count: 1 }));

    act(() => {
      result.current.updateField('count', (prev) => prev + 1);
    });

    assert.strictEqual(result.current.formData.count, 2);

    unmount();
  });

  it('saves to localStorage when data changes', async () => {
    const { result, unmount } = renderHook(() => useLetterStore({ field: 'initial' }));

    act(() => {
      result.current.updateField('field', 'updated');
    });

    // Wait for the 500ms timeout
    await new Promise(resolve => setTimeout(resolve, 550));

    const saved = globalThis.window.localStorage.getItem('axim_demand_letter_draft_v2');
    const parsed = JSON.parse(saved);
    assert.strictEqual(parsed.field, 'updated');

    unmount();
  });

  it('resets form data and removes from localStorage', () => {
    globalThis.window.localStorage.setItem('axim_demand_letter_draft_v2', JSON.stringify({ field: 'saved' }));
    const { result, unmount } = renderHook(() => useLetterStore({ field: 'initial' }));

    act(() => {
      result.current.resetForm();
    });

    assert.strictEqual(result.current.formData.field, 'initial');
    assert.strictEqual(globalThis.window.localStorage.getItem('axim_demand_letter_draft_v2'), null);

    unmount();
  });

  it('handles functional initialData', () => {
    const { result, unmount } = renderHook(() => useLetterStore(() => ({ field: 'functional_initial' })));

    assert.strictEqual(result.current.formData.field, 'functional_initial');

    unmount();
  });

  it('resets form data with functional initialData correctly', () => {
    const { result, unmount } = renderHook(() => useLetterStore(() => ({ field: 'functional_initial' })));

    act(() => {
      result.current.updateField('field', 'changed');
    });
    assert.strictEqual(result.current.formData.field, 'changed');

    act(() => {
      result.current.resetForm();
    });

    assert.strictEqual(result.current.formData.field, 'functional_initial');

    unmount();
  });
});
