import { test, describe, it, mock, afterEach, beforeEach } from 'node:test';
import assert from 'node:assert';
import { renderHook, act, cleanup, screen, waitFor } from '@testing-library/react';
import { usePayment } from '../src/hooks/usePayment.js';
import { ToastContext } from '../src/contexts/ToastContext.jsx';
import React from 'react';

// NO TOAST PROVIDER!
// This removes all React/Framer Motion timers that hang tests.

describe('usePayment', () => {
    let originalEnv;
    let originalConsoleError;
    let mockToast;

    beforeEach(() => {
        originalEnv = { ...process.env };
        originalConsoleError = console.error;
        console.error = mock.fn();

        process.env.VITE_PAYMENT_API_URL = 'http://test.api';
        process.env.NODE_ENV = 'development';

        if (globalThis.window) {
            if (globalThis.window.localStorage) {
                globalThis.window.localStorage.clear();
            }
            if (globalThis.window.sessionStorage) {
                globalThis.window.sessionStorage.clear();
            }
            if (globalThis.window.history) {
                globalThis.window.history.replaceState = mock.fn();
            }
            if (globalThis.window.location) {
                globalThis.window.location.search = '';
                // Since we simulate window.location.href assignment now
                Object.defineProperty(globalThis.window, 'location', {
                    value: {
                        ...globalThis.window.location,
                        href: 'about:blank',
                        search: ''
                    },
                    writable: true
                });
            }
        }

        globalThis.fetch = mock.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, transactionId: 'AXM-123', isPaid: true, accessToken: 'mock-token', expiresAt: new Date(Date.now() + 3600000).toISOString() })
        }));

        mockToast = {
            success: mock.fn(),
            error: mock.fn(),
            info: mock.fn()
        };
    });

    afterEach(() => {
        cleanup();
        mock.restoreAll();
        process.env = originalEnv;
        console.error = originalConsoleError;
        delete globalThis.fetch;
    });

    const wrapper = ({ children }) => (
        <ToastContext.Provider value={mockToast}>
            {children}
        </ToastContext.Provider>
    );

    it('initializes with correct default state', async () => {
        const { result, unmount } = renderHook(() => usePayment(), { wrapper });

        assert.strictEqual(result.current.isPaid, false);
        assert.strictEqual(result.current.isProcessing, false);
        assert.strictEqual(result.current.showPaymentModal, false);

        unmount();
    });

    it('handleProceedToCheckout calls onError when not valid', async () => {
        const { result, unmount } = renderHook(() => usePayment(), { wrapper });

        let errorCalled = false;
        const onError = () => { errorCalled = true; };

        act(() => {
            result.current.handleProceedToCheckout(false, onError);
        });

        assert.strictEqual(errorCalled, true);
        assert.strictEqual(result.current.showPaymentModal, false);

        unmount();
    });

    it('handleProceedToCheckout shows modal when valid', async () => {
        const { result, unmount } = renderHook(() => usePayment(), { wrapper });

        let errorCalled = false;
        const onError = () => { errorCalled = true; };

        act(() => {
            result.current.handleProceedToCheckout(true, onError);
        });

        assert.strictEqual(errorCalled, false);
        assert.strictEqual(result.current.showPaymentModal, true);

        unmount();
    });

    it('handlePayment handles payment processing error', async () => {
        globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ message: 'Payment processing failed' })
        }));

        const { result, unmount } = renderHook(() => usePayment(), { wrapper });

        const onError = mock.fn();

        await act(async () => {
            await result.current.handlePayment(true, onError);
        });

        assert.strictEqual(onError.mock.callCount(), 0);
        assert.strictEqual(result.current.isProcessing, false);
        assert.strictEqual(result.current.isPaid, false);
        assert.strictEqual(result.current.showPaymentModal, false);

        assert.strictEqual(mockToast.error.mock.callCount(), 1);
        assert.strictEqual(mockToast.error.mock.calls[0].arguments[0], 'Payment processing failed');

        unmount();
    });

    it('handlePayment calls onError when not valid', async () => {
        const { result, unmount } = renderHook(() => usePayment(), { wrapper });

        let errorCalled = false;
        const onError = () => { errorCalled = true; };

        await act(async () => {
            await result.current.handlePayment(false, onError);
        });

        assert.strictEqual(errorCalled, true);
        assert.strictEqual(result.current.isProcessing, false);

        unmount();
    });

    it('resetPayment works properly', async () => {
        const { result, unmount } = renderHook(() => usePayment(), { wrapper });

        act(() => {
            globalThis.window.sessionStorage.setItem('axim_access_token', 'mock-token');
            globalThis.window.sessionStorage.setItem('axim_token_expiry', new Date(Date.now() + 3600000).toISOString());
        });

        act(() => {
            result.current.resetPayment();
        });

        assert.strictEqual(result.current.isPaid, false);
        assert.strictEqual(globalThis.window.sessionStorage.getItem('axim_access_token'), null);
        assert.strictEqual(globalThis.window.sessionStorage.getItem('axim_token_expiry'), null);

        unmount();
    });

    it('handlePayment works correctly on success', async () => {
        const { result, unmount } = renderHook(() => usePayment(), { wrapper });

        const onError = mock.fn();

        await act(async () => {
            await result.current.handlePayment(true, onError);
        });

        assert.strictEqual(onError.mock.callCount(), 0);
        assert.strictEqual(result.current.isProcessing, false);
        assert.strictEqual(globalThis.window.location.href, '/success?session_id=AXM-123');

        unmount();
    });

    it('verifies session from url redirect', async () => {
        globalThis.window.location.search = '?session_id=AXM-valid-session';

        const { result, unmount } = renderHook(() => usePayment(), { wrapper });

        await waitFor(() => {
            assert.strictEqual(result.current.isPaid, true);
        });

        assert.strictEqual(globalThis.window.sessionStorage.getItem('axim_access_token'), 'mock-token');
        assert.strictEqual(globalThis.window.history.replaceState.mock.callCount(), 1);

        assert.strictEqual(mockToast.success.mock.callCount(), 1);
        unmount();
    });

    it('verifies session from url redirect on fail', async () => {
        globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ isPaid: false })
        }));

        globalThis.window.location.search = '?session_id=invalid-session';

        const { result, unmount } = renderHook(() => usePayment(), { wrapper });

        await waitFor(() => {
            assert.strictEqual(globalThis.window.history.replaceState.mock.callCount(), 1);
        });

        assert.strictEqual(result.current.isPaid, false);

        assert.strictEqual(mockToast.error.mock.callCount(), 1);
        unmount();
    });

    it('verifies session from sessionstorage', async () => {
        globalThis.window.sessionStorage.setItem('axim_access_token', 'mock-token');
        globalThis.window.sessionStorage.setItem('axim_token_expiry', new Date(Date.now() + 3600000).toISOString());

        const { result, unmount } = renderHook(() => usePayment(), { wrapper });

        await waitFor(() => {
            assert.strictEqual(result.current.isPaid, true);
        });

        unmount();
    });

    it('clears invalid sessionstorage session', async () => {
        globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ isPaid: false })
        }));

        globalThis.window.location.search = '?session_id=invalid-session';

        const { result, unmount } = renderHook(() => usePayment(), { wrapper });

        await waitFor(() => {
            assert.strictEqual(globalThis.window.sessionStorage.getItem('axim_access_token'), null);
        });
        assert.strictEqual(result.current.isPaid, false);

        unmount();
    });

    it('shows toast when payment is canceled', async () => {
        globalThis.window.location.search = '?canceled=true';

        const { unmount } = renderHook(() => usePayment(), { wrapper });

        await waitFor(() => {
            assert.strictEqual(globalThis.window.history.replaceState.mock.callCount(), 1);
        });

        assert.strictEqual(mockToast.error.mock.callCount(), 1);
        unmount();
    });
});
