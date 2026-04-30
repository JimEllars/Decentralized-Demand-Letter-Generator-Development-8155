import { test, describe, it, mock, afterEach, beforeEach } from 'node:test';
import assert from 'node:assert';
import { processPayment, verifyPaymentSession, initiateBackendTransaction } from '../src/services/paymentService.js';

describe('paymentService', () => {
  let originalEnv;
  let originalConsoleError;

  beforeEach(() => {
    originalEnv = { ...process.env };
    originalConsoleError = console.error;
    console.error = mock.fn();

    globalThis.fetch = mock.fn();
    globalThis.window = {
      location: {
        href: '',
        origin: 'http://localhost'
      }
    };
  });

  afterEach(() => {
    console.error = originalConsoleError;
    process.env = originalEnv;
    delete globalThis.fetch;
    delete globalThis.window;
  });

  describe('processPayment', () => {
    it('should initiate backend transaction', async () => {
      globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, transactionId: 'real-tx-123' })
      }));

      const productId = 'test_product';
      const result = await processPayment(productId);

      assert.strictEqual(result.success, true);
      assert.strictEqual(globalThis.fetch.mock.calls.length, 1);
    });

    it('should throw an error when fetch fails (response not ok) via processPayment', async () => {
      globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to create payment session' })
      }));

      await assert.rejects(
        async () => await processPayment('test_product'),
        { message: 'Failed to create payment session' }
      );
    });
  });

  describe('verifyPaymentSession', () => {
    it('should call backend correctly', async () => {
      globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ isPaid: true })
      }));

      const result = await verifyPaymentSession('real-session-id');
      assert.strictEqual(result.isPaid, true);
    });

    it('should throw an error when fetch fails to verify', async () => {
      globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
        ok: false
      }));

      await assert.rejects(
        async () => await verifyPaymentSession('real-session-id'),
        { message: 'Failed to verify payment session' }
      );
    });
  });
});
