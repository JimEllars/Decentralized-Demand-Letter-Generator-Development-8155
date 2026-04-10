import { test, describe, it, mock, afterEach } from 'node:test';
import assert from 'node:assert';
import { renderHook, act, cleanup, screen } from '@testing-library/react';
import { usePdfGenerator } from '../src/hooks/usePdfGenerator.js';
import { ToastProvider, useToast } from '../src/contexts/ToastContext.jsx';
import React from 'react';

// Use a wrapper to expose useToast for spying, but do it in a way that captures it properly.
let capturedToast;

const CaptureToastWrapper = ({ children }) => {
    capturedToast = useToast();
    return <>{children}</>;
};

describe('usePdfGenerator', () => {
    afterEach(() => {
        cleanup();
        mock.restoreAll();
        capturedToast = undefined;
    });

    const wrapper = ({ children }) => (
        <ToastProvider>
            <CaptureToastWrapper>{children}</CaptureToastWrapper>
        </ToastProvider>
    );

    it('returns early when isValid is false', async () => {
        const { result } = renderHook(() => usePdfGenerator(), { wrapper });

        let errorCalled = false;
        const onError = () => { errorCalled = true; };

        await act(async () => {
            await result.current.handleDownload(false, onError);
        });

        assert.strictEqual(errorCalled, true);
        assert.strictEqual(result.current.isGenerating, false);
    });

    it('blocks download and shows error if token is missing when isPaid is true', async () => {
        const { result } = renderHook(() => usePdfGenerator(), { wrapper });

        const onError = mock.fn();
        const formData = { jurisdiction: 'CA' };
        const calculatedValues = {};
        const toneTemplate = {};

        // We don't set a mock token in sessionStorage

        await act(async () => {
            await result.current.handleDownload(true, onError, formData, calculatedValues, toneTemplate, true);
        });

        assert.strictEqual(onError.mock.callCount(), 0);
        assert.strictEqual(result.current.isGenerating, false);

        const toast = await screen.findByText('Payment session expired. Please complete payment again.');
        assert.ok(toast);
    });

    it('generates pdf successfully and shows success toast', async () => {
        const { result } = renderHook(() => usePdfGenerator(), { wrapper });

        globalThis.window.sessionStorage.setItem('axim_access_token', 'mock-token');
        globalThis.window.sessionStorage.setItem('axim_token_expiry', new Date(Date.now() + 3600000).toISOString());

        const onError = mock.fn();
        const formData = { jurisdiction: 'CA' };

        const calculatedValues = {
            formattedTotal: '$1,000.00',
            formattedInterest: '$50.00',
            rateUsed: 5,
            statuteUsed: 'Statute 123',
            items: [ { description: 'Item 1', amount: '100' } ]
        };

        const toneTemplate = { title: "Test", intro: "Test", closing: "Test" };

        const originalDocumentCreateElement = document.createElement;
        const mockAnchor = {
            href: '',
            download: '',
            style: { display: '' },
            click: mock.fn(),
            remove: mock.fn(),
            setAttribute: mock.fn()
        };

        document.createElement = mock.fn((tag) => {
            if (tag === 'a') return mockAnchor;
            return originalDocumentCreateElement.call(document, tag);
        });

        const originalURLCreateObjectURL = globalThis.URL.createObjectURL;
        globalThis.URL.createObjectURL = mock.fn(() => 'blob:mock');

        const originalCreateEvent = document.createEvent;
        document.createEvent = mock.fn((type) => {
            if (type === 'MouseEvents') {
                return { initMouseEvent: mock.fn() };
            }
            return originalCreateEvent.call(document, type);
        });

        try {
            await act(async () => {
                await result.current.handleDownload(true, onError, formData, calculatedValues, toneTemplate, false);
            });

            assert.strictEqual(onError.mock.callCount(), 0);
            assert.strictEqual(result.current.isGenerating, false);

            const toast = await screen.findByText('Download started!');
            assert.ok(toast);
        } finally {
            document.createElement = originalDocumentCreateElement;
            globalThis.URL.createObjectURL = originalURLCreateObjectURL;
            document.createEvent = originalCreateEvent;
        }
    });

    it('handles pdf generation errors gracefully and shows error toast', async () => {
        const { result } = renderHook(() => usePdfGenerator(), { wrapper });

        const onError = mock.fn();
        const formData = { jurisdiction: 'CA' };

        const calculatedValues = {
            formattedTotal: '$1,000.00',
            formattedInterest: '$50.00',
            rateUsed: 5,
            statuteUsed: 'Statute 123',
            items: [ { description: 'Item 1', amount: '100' } ]
        };

        const toneTemplate = { title: "Test", intro: "Test", closing: "Test" };

        // We will intercept the `import()` or `pdfMakeModule` but `Promise.all` works best.
        // It failed previously with `unhandledRejection` because `Promise.all` throws synchronously inside `try/catch`
        // Wait! It DIDN'T throw inside try catch if we used `Promise.all` mock that rejected.
        // It did reject. Why did it cause an unhandled rejection?
        // Oh, `framer-motion` or something might use `Promise.all`!
        // So we must conditionally mock `Promise.all`.
        const originalPromiseAll = Promise.all;
        Promise.all = mock.fn(async (args) => {
            if (Array.isArray(args) && args.length === 2 && typeof args[0] === 'object' && args[0] instanceof Promise) {
                // If the dynamic imports are triggered, they are promises. We throw here.
                throw new Error("Simulated load error");
            }
            return originalPromiseAll.call(Promise, args);
        });

        const originalConsoleError = console.error;
        console.error = mock.fn();

        try {
            await act(async () => {
                await result.current.handleDownload(true, onError, formData, calculatedValues, toneTemplate, false);
            });

            assert.strictEqual(onError.mock.callCount(), 0);
            assert.strictEqual(result.current.isGenerating, false);

            const toast = await screen.findByText(/Failed to generate PDF/);
            assert.ok(toast);
        } finally {
            Promise.all = originalPromiseAll;
            console.error = originalConsoleError;
        }
    });
});
