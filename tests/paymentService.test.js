import { test, describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { processPayment, initiateBackendTransaction } from '../src/services/paymentService.js';

describe('paymentService', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };

    // Mock fetch
    globalThis.fetch = mock.fn();

    // Mock window.location
    globalThis.window = {
      location: {
        href: ''
      }
    };

    // Mock crypto.randomUUID
    if (!globalThis.crypto) {
      globalThis.crypto = {};
    }
    globalThis.crypto.randomUUID = mock.fn(() => '12345678-abcd-efgh-ijkl-mnopqrstuvwx');
  });

  afterEach(() => {
    process.env = originalEnv;
    delete globalThis.fetch;
    delete globalThis.window;
  });

  describe('processPayment', () => {
    it('should fall back to simulation mode when VITE_PAYMENT_API_URL is not configured', async () => {
      // Ensure VITE_PAYMENT_API_URL is undefined
      delete process.env.VITE_PAYMENT_API_URL;

      const amount = 99.99;
      const startTime = Date.now();

      const result = await processPayment(amount);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Check the timeout length (approx 1500ms)
      assert.ok(duration >= 1400, `Duration was ${duration}ms, expected >= 1400ms`);

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.transactionId, 'AXM-12345678');
      assert.ok(result.timestamp);
    });

    it('should initiate backend transaction when VITE_PAYMENT_API_URL is configured', async () => {
      process.env.VITE_PAYMENT_API_URL = 'http://api.example.com';

      // Mock fetch response for a successful transaction without url (data.success = true)
      globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, transactionId: 'real-tx-123' })
      }));

      const amount = 50.00;
      const result = await processPayment(amount);

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.transactionId, 'real-tx-123');

      // Verify fetch was called correctly
      assert.strictEqual(globalThis.fetch.mock.calls.length, 1);
      const fetchCall = globalThis.fetch.mock.calls[0];
      assert.strictEqual(fetchCall.arguments[0], 'http://api.example.com/create-checkout-session');
      assert.strictEqual(fetchCall.arguments[1].method, 'POST');
      assert.strictEqual(fetchCall.arguments[1].body, JSON.stringify({ amount: 50.00 }));
    });
  });

  describe('initiateBackendTransaction', () => {
    it('should successfully initiate a transaction when data.success is true', async () => {
      globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, transactionId: 'test-tx-123' })
      }));

      const result = await initiateBackendTransaction('http://test.api', 100);

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.transactionId, 'test-tx-123');
    });

    it('should redirect window when data.url is returned', async () => {
      globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ url: 'https://checkout.stripe.com/test' })
      }));

      // initiateBackendTransaction returns a Promise that never resolves in this case,
      initiateBackendTransaction('http://test.api', 100);

      // Wait a tick for promises to resolve
      await new Promise(resolve => setTimeout(resolve, 0));

      assert.strictEqual(globalThis.window.location.href, 'https://checkout.stripe.com/test');
    });

    it('should throw an error when fetch fails (response not ok)', async () => {
      globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'API rate limit exceeded' })
      }));

      await assert.rejects(
        async () => await initiateBackendTransaction('http://test.api', 100),
        { message: 'API rate limit exceeded' }
      );
    });

    it('should throw an error when response is invalid (missing url and success)', async () => {
      globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ foo: 'bar' })
      }));

      await assert.rejects(
        async () => await initiateBackendTransaction('http://test.api', 100),
        { message: 'Invalid response from payment provider: Missing checkout url' }
      );
    });

    it('should throw an error when fetch completely fails (network error)', async () => {
      globalThis.fetch.mock.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

      await assert.rejects(
        async () => await initiateBackendTransaction('http://test.api', 100),
        { message: 'Network error' }
      );
    });
  });
});
