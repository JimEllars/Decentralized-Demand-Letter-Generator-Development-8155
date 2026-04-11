import { test, describe, it, mock, afterEach, beforeEach } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, screen, waitFor, cleanup, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastContext } from '../src/contexts/ToastContext.jsx';
import SuccessPage from '../src/components/SuccessPage.jsx';

describe('SuccessPage', () => {
  let originalConsoleError;
  let mockToastError;
  let mockToastSuccess;
  let originalFetch;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = mock.fn();
    mockToastError = mock.fn();
    mockToastSuccess = mock.fn();

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

  it('handles empty email error when sending email', async () => {
    const originalUrl = process.env.VITE_PAYMENT_API_URL;
    process.env.VITE_PAYMENT_API_URL = 'http://test.api';

    globalThis.fetch = mock.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ isPaid: true })
    }));

    render(
      <ToastContext.Provider value={{ error: mockToastError, success: mockToastSuccess, info: mock.fn() }}>
        <MemoryRouter initialEntries={['/?session_id=test-session-id']}>
          <Routes>
            <Route path="/" element={<SuccessPage />} />
          </Routes>
        </MemoryRouter>
      </ToastContext.Provider>
    );

    // Wait for successful verification state
    await waitFor(() => {
      const el = screen.queryByText('Payment Successful');
      if (!el) throw new Error('Not found');
    });

    // Try to send without typing an email by circumventing the disabled attribute
    // to test the form submission logic directly
    const sendButton = screen.getByRole('button', { name: /Send/i });
    sendButton.removeAttribute('disabled');
    fireEvent.click(sendButton);

    assert.strictEqual(mockToastError.mock.calls.length, 1);
    assert.strictEqual(mockToastError.mock.calls[0].arguments[0], 'Please enter a valid email address.');

    process.env.VITE_PAYMENT_API_URL = originalUrl;
  });

  it('handles email sending simulation successfully', async () => {
    const originalUrl = process.env.VITE_PAYMENT_API_URL;
    process.env.VITE_PAYMENT_API_URL = 'http://test.api';

    globalThis.fetch = mock.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ isPaid: true })
    }));

    render(
      <ToastContext.Provider value={{ error: mockToastError, success: mockToastSuccess, info: mock.fn() }}>
        <MemoryRouter initialEntries={['/?session_id=test-session-id']}>
          <Routes>
            <Route path="/" element={<SuccessPage />} />
          </Routes>
        </MemoryRouter>
      </ToastContext.Provider>
    );

    // Wait for successful verification state
    await waitFor(() => {
      const el = screen.queryByText('Payment Successful');
      if (!el) throw new Error('Not found');
    });

    const emailInput = screen.getByPlaceholderText('Enter email address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const sendButton = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(sendButton);

    // After clicking, the button text changes to a spinner (so "Send" is no longer there)
    assert.ok(screen.queryByText('Send') === null);

    // Wait for the simulated delay in handleSendEmail
    await act(async () => {
      await new Promise(r => setTimeout(r, 1600));
    });

    assert.strictEqual(mockToastSuccess.mock.calls.length, 1);
    assert.strictEqual(mockToastSuccess.mock.calls[0].arguments[0], 'Document sent to test@example.com');
    assert.strictEqual(emailInput.value, ''); // Email input should be cleared

    process.env.VITE_PAYMENT_API_URL = originalUrl;
  });
});
