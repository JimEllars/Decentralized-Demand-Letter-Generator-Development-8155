import { test, describe, it, mock, afterEach, beforeEach } from 'node:test';
import assert from 'node:assert';
import { renderHook, act, cleanup, waitFor } from '@testing-library/react';
import { useLetterStore } from '../src/hooks/useLetterStore.js';
import { ToastProvider } from '../src/contexts/ToastContext.jsx';

const wrapper = ({ children }) => <ToastProvider>{children}</ToastProvider>;

describe('useLetterStore', () => {
  beforeEach(() => {
    if (globalThis.window) {
      if (globalThis.window.localStorage) {
        globalThis.window.localStorage.clear();
      }
      if (globalThis.window.sessionStorage) {
        globalThis.window.sessionStorage.clear();
      }
    }
  });

  afterEach(() => {
    cleanup();
    mock.restoreAll();
  });

  it('initializes with initialData if storage is empty', () => {
    const { result, unmount } = renderHook(() => useLetterStore({ test: 'initial' }), { wrapper });

    assert.strictEqual(result.current.formData.test, 'initial');
    assert.strictEqual(result.current.isInitialized, true);

    unmount();
  });

  it('initializes gracefully when storage contains invalid JSON', () => {
    // Mock storage to return invalid JSON
    globalThis.window.localStorage.setItem('axim_demand_letter_draft', '{invalid_json}');

    const { result, unmount } = renderHook(() => useLetterStore({ test: 'fallback' }), { wrapper });

    // Should fallback to initial data gracefully
    assert.strictEqual(result.current.formData.test, 'fallback');
    assert.strictEqual(result.current.isInitialized, true);

    unmount();
  });

  it('initializes from valid JSON in storage', () => {
    const validData = { formData: { test: 'saved_value', items: [] }, currentStep: 2 };
    globalThis.window.localStorage.setItem('axim_demand_letter_draft', JSON.stringify(validData));

    const { result, unmount } = renderHook(() => useLetterStore({ test: 'fallback' }), { wrapper });

    assert.strictEqual(result.current.formData.test, 'saved_value');
    assert.strictEqual(result.current.currentStep, 2);

    unmount();
  });

  it('updates a field correctly', async () => {
    const { result, unmount } = renderHook(() => useLetterStore({ field1: 'value1' }), { wrapper });

    act(() => {
      result.current.updateField('field1', 'new_value');
    });

    assert.strictEqual(result.current.formData.field1, 'new_value');

    unmount();
  });

  it('updates a field using a functional update', async () => {
    const { result, unmount } = renderHook(() => useLetterStore({ count: 1 }), { wrapper });

    act(() => {
      result.current.updateField('count', (prev) => prev + 1);
    });

    assert.strictEqual(result.current.formData.count, 2);

    unmount();
  });

  it('saves to storage when data changes', async () => {
    const { result, unmount } = renderHook(() => useLetterStore({ field: 'initial' }), { wrapper });

    act(() => {
      result.current.updateField('field', 'updated');
    });

    // Wait for the persist to sync
    await waitFor(() => {
      const saved = globalThis.window.localStorage.getItem('axim_demand_letter_draft');
      const parsed = JSON.parse(saved);
      assert.strictEqual(parsed.formData.field, 'updated');
    });

    unmount();
  });

  it('resets form data and removes from storage', () => {
    globalThis.window.localStorage.setItem('axim_demand_letter_draft', JSON.stringify({ state: { formData: { field: 'saved' }, currentStep: 2 } }));
    const { result, unmount } = renderHook(() => useLetterStore({ field: 'initial' }), { wrapper });

    act(() => {
      result.current.resetForm();
    });

    assert.strictEqual(result.current.formData.field, 'initial');
    assert.strictEqual(result.current.currentStep, 1);
    assert.strictEqual(globalThis.window.localStorage.getItem('axim_demand_letter_draft'), null);

    unmount();
  });

  it('handles functional initialData', () => {
    const { result, unmount } = renderHook(() => useLetterStore(() => ({ field: 'functional_initial' })), { wrapper });

    assert.strictEqual(result.current.formData.field, 'functional_initial');

    unmount();
  });

  it('resets form data with functional initialData correctly', () => {
    const { result, unmount } = renderHook(() => useLetterStore(() => ({ field: 'functional_initial' })), { wrapper });

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
