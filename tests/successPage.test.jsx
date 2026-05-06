import { test, describe, mock, afterEach, beforeEach } from 'node:test';
import assert from 'node:assert';
import { render, screen, cleanup, act, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SuccessPage from '../src/components/SuccessPage';
import { ToastContext } from '../src/contexts/ToastContext';
import * as paymentService from '../src/services/paymentService';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Just mock fetch
describe('SuccessPage', () => {
  let mockToastError;
  let mockToastSuccess;
  let originalFetch;

  beforeEach(() => {
    mockToastError = mock.fn();
    mockToastSuccess = mock.fn();
    originalFetch = globalThis.fetch;

    if (globalThis.window) {
      if (globalThis.window.localStorage) {
        globalThis.window.localStorage.clear();
        mock.method(Storage.prototype, 'removeItem');
      }
      if (globalThis.window.sessionStorage) {
        globalThis.window.sessionStorage.clear();
      }
    }

    // We also need to mock import.meta.env for verification via fetch
    process.env.VITE_PAYMENT_API_URL = 'http://test.api';
  });

  afterEach(() => {
    cleanup();
    mock.restoreAll();
    globalThis.fetch = originalFetch;
    delete process.env.VITE_PAYMENT_API_URL;
  });



  test.skip('handles email sending successfully', async () => {
    sessionStorage.removeItem('axim_delivery_email');

    globalThis.fetch = mock.fn(async (url, options) => {
      if (typeof url === 'string' && url.includes('verify')) {
        return {
          ok: true,
          json: () => Promise.resolve({ isPaid: true, status: 'paid', payment_status: 'paid' })
        };
      }
      if (typeof url === 'string' && url.includes('document-orchestrator')) {
        return {
          ok: true,
          json: () => Promise.resolve({ success: true })
        };
      }
      return { ok: false };
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ToastContext.Provider value={{ error: mockToastError, success: mockToastSuccess, info: mock.fn() }}>
          <MemoryRouter initialEntries={['/?session_id=test-session-id']}>
            <Routes>
              <Route path="/" element={<SuccessPage />} />
            </Routes>
          </MemoryRouter>
        </ToastContext.Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      assert.ok(screen.queryByText('Payment Successful'));
    });

    const emailInput = screen.getByPlaceholderText('Enter email address');
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    });

    const emailForm = emailInput.closest('form');
    const sendButton = emailForm.querySelector('button[type="submit"]');

    await act(async () => {
      fireEvent.click(sendButton);
      await new Promise(r => setTimeout(r, 0));
    });

    await waitFor(() => {
      const emailToastCall = mockToastSuccess.mock.calls.find(call =>
        call.arguments[0] === 'Document sent to test@example.com'
      );
      assert.ok(emailToastCall, `mockToastSuccess should be called with email message`);
    }, { timeout: 2000 });

    assert.strictEqual(emailInput.value, '');
  });
});
