import { test, describe, it, mock, afterEach, beforeEach } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastContext } from '../src/contexts/ToastContext.jsx';
import SuccessPage from '../src/components/SuccessPage.jsx';

describe('SuccessPage', () => {
  let originalConsoleError;
  let mockToastError;
  let originalFetch;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = mock.fn();
    mockToastError = mock.fn();

    // Fall back to mocking fetch since mocking ES module exports natively fails in node:test
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    cleanup();
    console.error = originalConsoleError;
    globalThis.fetch = originalFetch;
    mock.restoreAll();
  });

  it('should handle verifyPaymentSession errors gracefully', async () => {
    // To trigger an error in verifyPaymentSession without changing NODE_ENV,
    // we ensure VITE_PAYMENT_API_URL is set so it uses fetch, then mock fetch to reject.
    const originalUrl = process.env.VITE_PAYMENT_API_URL;
    process.env.VITE_PAYMENT_API_URL = 'http://test.api';

    globalThis.fetch = mock.fn(() => Promise.reject(new Error('Network error')));

    render(
      <ToastContext.Provider value={{ error: mockToastError, success: mock.fn(), info: mock.fn() }}>
        <MemoryRouter initialEntries={['/?session_id=test-session-id']}>
          <Routes>
            <Route path="/" element={<SuccessPage />} />
          </Routes>
        </MemoryRouter>
      </ToastContext.Provider>
    );

    // Initial state might be verifying, but it should quickly change to failed
    await waitFor(() => {
      const failedText = screen.queryByText('Verification Failed');
      assert.ok(failedText, 'Verification Failed text should be displayed');
    });

    // Also assert the toast error was called
    assert.strictEqual(mockToastError.mock.calls.length, 1, 'toast.error should be called once');
    assert.strictEqual(mockToastError.mock.calls[0].arguments[0], 'Payment verification failed.', 'toast.error should receive the correct message');

    process.env.VITE_PAYMENT_API_URL = originalUrl;
  });
});
