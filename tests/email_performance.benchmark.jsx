import { test, describe, it, mock, afterEach, beforeEach } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, screen, waitFor, cleanup, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastContext } from '../src/contexts/ToastContext.jsx';
import SuccessPage from '../src/components/SuccessPage.jsx';

describe('Email Performance Benchmark', () => {
  let mockToastSuccess = mock.fn();
  let originalFetch;

  beforeEach(() => {
    mockToastSuccess = mock.fn();
    originalFetch = globalThis.fetch;
    // Mock fetch to avoid network calls during verification
    globalThis.fetch = mock.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ isPaid: true })
    }));
  });

  afterEach(() => {
    cleanup();
    globalThis.fetch = originalFetch;
    mock.restoreAll();
  });

  it('measures manual email sending delay', async () => {
    sessionStorage.removeItem('axim_delivery_email');

    render(
      <ToastContext.Provider value={{ error: mock.fn(), success: mockToastSuccess, info: mock.fn() }}>
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

    const emailInput = screen.getByPlaceholderText('Enter email address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const emailForm = emailInput.closest('form');
    const sendButton = emailForm.querySelector('button[type="submit"]');

    const startTime = performance.now();
    fireEvent.click(sendButton);

    // Wait for toast success which indicates completion
    await waitFor(() => {
      assert.strictEqual(mockToastSuccess.mock.calls.length, 1);
    }, { timeout: 5000 });

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`Manual Email Sending Duration: ${duration.toFixed(2)}ms`);
  });

  it('measures auto email sending delay', async () => {
    sessionStorage.setItem('axim_delivery_email', 'auto@example.com');

    const startTime = performance.now();
    render(
      <ToastContext.Provider value={{ error: mock.fn(), success: mockToastSuccess, info: mock.fn() }}>
        <MemoryRouter initialEntries={['/?session_id=test-session-id']}>
          <Routes>
            <Route path="/" element={<SuccessPage />} />
          </Routes>
        </MemoryRouter>
      </ToastContext.Provider>
    );

    // Wait for toast success which indicates completion of auto-send
    await waitFor(() => {
        const autoSendCall = mockToastSuccess.mock.calls.find(call =>
            call.arguments[0].includes('automatically sent')
        );
        assert.ok(autoSendCall);
    }, { timeout: 5000 });

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`Auto Email Sending Duration (from mount): ${duration.toFixed(2)}ms`);
    sessionStorage.removeItem('axim_delivery_email');
  });
});
