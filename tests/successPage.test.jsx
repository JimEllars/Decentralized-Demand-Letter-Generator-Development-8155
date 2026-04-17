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

    // Assert console.error was called with the correct message by the component
    const componentErrorCalls = console.error.mock.calls.filter(call => call.arguments[0] === 'Verification error:');
    assert.strictEqual(componentErrorCalls.length, 1, 'SuccessPage console.error should be called when mounted');

    process.env.VITE_PAYMENT_API_URL = originalUrl;
  });

  it('does not update state or show toast if unmounted during verifyPaymentSession error', async () => {
    const originalUrl = process.env.VITE_PAYMENT_API_URL;
    process.env.VITE_PAYMENT_API_URL = 'http://test.api';

    // Create a promise that we can reject manually to control timing
    let rejectPromise;
    const fetchPromise = new Promise((resolve, reject) => {
      rejectPromise = reject;
    });

    globalThis.fetch = mock.fn(() => fetchPromise);

    const { unmount } = render(
      <ToastContext.Provider value={{ error: mockToastError, success: mock.fn(), info: mock.fn() }}>
        <MemoryRouter initialEntries={['/?session_id=test-session-id']}>
          <Routes>
            <Route path="/" element={<SuccessPage />} />
          </Routes>
        </MemoryRouter>
      </ToastContext.Provider>
    );

    // Unmount before the promise settles
    unmount();

    // Now reject the promise
    rejectPromise(new Error('Network error after unmount'));

    // Wait a tick for the microtask queue to process the rejection
    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    // Assert that no error toast was called
    // In SuccessPage.jsx: `if (!isMounted) return;` happens before `console.error` and `toast.error` inside the catch block.
    assert.strictEqual(mockToastError.mock.calls.length, 0, 'toast.error should not be called if unmounted');

    // Note: console.error is still called once by verifyPaymentSession itself internally before it throws to the component
    // But the component's own console.error ("Verification error:") should not be called.
    const componentErrorCalls = console.error.mock.calls.filter(call => call.arguments[0] === 'Verification error:');
    assert.strictEqual(componentErrorCalls.length, 0, 'SuccessPage console.error should not be called if unmounted');

    process.env.VITE_PAYMENT_API_URL = originalUrl;
  });

  it('handles Download Again button successfully', async () => {
    const originalUrl = process.env.VITE_PAYMENT_API_URL;
    process.env.VITE_PAYMENT_API_URL = 'http://test.api';

    globalThis.fetch = mock.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ isPaid: true })
    }));

    const { unmount } = render(
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
      assert.ok(screen.queryByText('Payment Successful'));
    });

    const downloadButton = screen.getByRole('button', { name: /Download Again/i });
    fireEvent.click(downloadButton);

    process.env.VITE_PAYMENT_API_URL = originalUrl;
  });

  it('handles Create Another Letter button successfully', async () => {
    const originalUrl = process.env.VITE_PAYMENT_API_URL;
    process.env.VITE_PAYMENT_API_URL = 'http://test.api';

    globalThis.fetch = mock.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ isPaid: true })
    }));

    // We can spy on global objects using mock.method
    mock.method(Storage.prototype, 'removeItem');

    const { unmount } = render(
      <ToastContext.Provider value={{ error: mockToastError, success: mockToastSuccess, info: mock.fn() }}>
        <MemoryRouter initialEntries={['/?session_id=test-session-id']}>
          <Routes>
            <Route path="/" element={<SuccessPage />} />
            <Route path="/app/demand-generator" element={<div data-testid="generator-page">Generator Page</div>} />
          </Routes>
        </MemoryRouter>
      </ToastContext.Provider>
    );

    try {
      // Wait for successful verification state
      await waitFor(() => {
        assert.ok(screen.queryByText('Payment Successful'));
      });

      const createAnotherButton = screen.getByRole('button', { name: /Create Another Letter/i });
      fireEvent.click(createAnotherButton);

      // Verify localStorage was cleared
      assert.ok(Storage.prototype.removeItem.mock.calls.some(call => call.arguments[0] === 'axim_demand_letter_paid_status'), 'localStorage paid status should be cleared');

      // Verify sessionStorage was cleared
      assert.ok(Storage.prototype.removeItem.mock.calls.some(call => call.arguments[0] === 'axim_demand_letter_draft'), 'sessionStorage draft should be cleared');
      assert.ok(Storage.prototype.removeItem.mock.calls.some(call => call.arguments[0] === 'axim_access_token'), 'sessionStorage access token should be cleared');
      assert.ok(Storage.prototype.removeItem.mock.calls.some(call => call.arguments[0] === 'axim_token_expiry'), 'sessionStorage token expiry should be cleared');

      // Verify navigation occurred
      assert.ok(screen.getByTestId('generator-page'), 'Should navigate to generator page');
    } finally {
      process.env.VITE_PAYMENT_API_URL = originalUrl;
      Storage.prototype.removeItem.mock.restore();
    }
  });

  it('fails gracefully when session_id is missing', async () => {
    render(
      <ToastContext.Provider value={{ error: mockToastError, success: mock.fn(), info: mock.fn() }}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<SuccessPage />} />
          </Routes>
        </MemoryRouter>
      </ToastContext.Provider>
    );

    await waitFor(() => {
      const failedText = screen.queryByText('Verification Failed');
      assert.ok(failedText, 'Verification Failed text should be displayed');
    });
  });

  it('fails gracefully when payment verification returns false', async () => {
    const originalUrl = process.env.VITE_PAYMENT_API_URL;
    process.env.VITE_PAYMENT_API_URL = 'http://test.api';

    globalThis.fetch = mock.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ isPaid: false })
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
      assert.ok(screen.queryByText('Verification Failed'));
    });

    process.env.VITE_PAYMENT_API_URL = originalUrl;
  });

  it('handles Return Home button on failure', async () => {
    render(
      <ToastContext.Provider value={{ error: mockToastError, success: mock.fn(), info: mock.fn() }}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<SuccessPage />} />
          </Routes>
        </MemoryRouter>
      </ToastContext.Provider>
    );

    await waitFor(() => {
      assert.ok(screen.queryByText('Verification Failed'));
    });

    const returnHomeButton = screen.getByRole('button', { name: /Return Home/i });
    fireEvent.click(returnHomeButton);
  });

  it('triggers auto-download after successful verification', async () => {
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
      assert.ok(screen.queryByText('Payment Successful'));
    });

    // Wait for the setTimeout in auto-download to trigger
    await act(async () => {
      await new Promise(r => setTimeout(r, 1100));
    });

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
      assert.ok(screen.queryByText('Payment Successful'));
    });

    // Try to send without typing an email by circumventing the disabled attribute
    // to test the form submission logic directly
    const emailInput = screen.getByPlaceholderText('Enter email address');
    const emailForm = emailInput.closest('form');
    const sendButton = emailForm.querySelector('button[type="submit"]');

    sendButton.removeAttribute('disabled');
    fireEvent.click(sendButton);

    assert.strictEqual(mockToastError.mock.calls.length, 1);
    assert.strictEqual(mockToastError.mock.calls[0].arguments[0], 'Please enter a valid email address.');

    process.env.VITE_PAYMENT_API_URL = originalUrl;
  });

  it('handles email sending successfully', async () => {
    sessionStorage.removeItem('axim_delivery_email');

    const originalUrl = process.env.VITE_PAYMENT_API_URL;
    process.env.VITE_PAYMENT_API_URL = 'http://test.api';

    let fetchCallCount = 0;
    globalThis.fetch = mock.fn(async (url, options) => {
      fetchCallCount++;

      // Respond to payment verification
      if (url.includes('verify')) {
        return {
          ok: true,
          json: () => Promise.resolve({ isPaid: true })
        };
      }

      // Respond to email send
      if (url === '/api/send-email') {
        return {
          ok: true,
          json: () => Promise.resolve({ success: true })
        };
      }

      return { ok: false };
    });

    render(
      <ToastContext.Provider value={{ error: mockToastError, success: mockToastSuccess, info: mock.fn() }}>
        <MemoryRouter initialEntries={['/?session_id=test-session-id']}>
          <Routes>
            <Route path="/" element={<SuccessPage />} />
          </Routes>
        </MemoryRouter>
      </ToastContext.Provider>
    );

    // Wait for successful verification
    await waitFor(() => {
      assert.ok(screen.queryByText('Payment Successful'));
    });

    // Type email and submit form
    const emailInput = screen.getByPlaceholderText('Enter email address');
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    });

    const emailForm = emailInput.closest('form');
    const sendButton = emailForm.querySelector('button[type="submit"]');

    await act(async () => {
      fireEvent.click(sendButton);
      // Wait for fetch promise to settle
      await new Promise(r => setTimeout(r, 0));
    });

    // The key assertion: mockToastSuccess should have been called with the email message
    await waitFor(() => {
      const emailToastCall = mockToastSuccess.mock.calls.find(call =>
        call.arguments[0] === 'Document sent to test@example.com'
      );
      assert.ok(emailToastCall, `mockToastSuccess should be called with email message. Calls: ${JSON.stringify(mockToastSuccess.mock.calls)}`);
    }, { timeout: 2000 });

    // Verify email input was cleared
    assert.strictEqual(emailInput.value, '');

    process.env.VITE_PAYMENT_API_URL = originalUrl;
  });
});
