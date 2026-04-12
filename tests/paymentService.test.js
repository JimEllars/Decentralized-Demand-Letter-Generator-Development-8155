import { test, describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { processPayment, initiateBackendTransaction, verifyPaymentSession } from '../src/services/paymentService.js';

describe('paymentService', () => {
  let originalEnv;
  let originalConsoleError;

  beforeEach(() => {
    originalEnv = { ...process.env };
    originalConsoleError = console.error;
    console.error = mock.fn(); // Suppress expected error logs during tests

    // Mock fetch
    globalThis.fetch = mock.fn();

    // Mock window.location
    globalThis.window = {
      location: {
        href: ''
      }
    };

    // Mock sessionStorage
    const store = new Map();
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: {
        setItem: mock.fn((key, value) => store.set(key, value)),
        getItem: mock.fn((key) => store.get(key) || null),
        removeItem: mock.fn((key) => store.delete(key)),
        clear: mock.fn(() => store.clear())
      },
      writable: true,
      configurable: true
    });

    // Mock crypto.randomUUID
    if (!globalThis.crypto) {
      globalThis.crypto = {};
    }
    globalThis.crypto.randomUUID = mock.fn(() => '12345678-abcd-efgh-ijkl-mnopqrstuvwx');
  });

  afterEach(() => {
    console.error = originalConsoleError;
    process.env = originalEnv;
    delete globalThis.fetch;
    delete globalThis.window;
  });

  describe('processPayment', () => {
    it('should fall back to simulation mode when VITE_PAYMENT_API_URL is not configured', async () => {
      // Ensure VITE_PAYMENT_API_URL is undefined
      delete process.env.VITE_PAYMENT_API_URL;

      const productId = 'demand_letter';
      const startTime = Date.now();

      const result = await processPayment(productId);

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

      const productId = 'test_product';
      const result = await processPayment(productId);

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.transactionId, 'real-tx-123');

      // Verify fetch was called correctly
      assert.strictEqual(globalThis.fetch.mock.calls.length, 1);
      const fetchCall = globalThis.fetch.mock.calls[0];
      assert.strictEqual(fetchCall.arguments[0], 'http://api.example.com/create-checkout-session');
      assert.strictEqual(fetchCall.arguments[1].method, 'POST');
      assert.strictEqual(fetchCall.arguments[1].body, JSON.stringify({ productId: 'test_product' }));
    });
    it('should throw an error when fetch fails (response not ok) via processPayment', async () => {
      process.env.VITE_PAYMENT_API_URL = 'http://api.example.com';
      globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to create payment session' })
      }));

      await assert.rejects(
        async () => await processPayment('test_product'),
        { message: 'Failed to create payment session' }
      );
    });

    it('should throw an error when fetch completely fails (network error) via processPayment', async () => {
      process.env.VITE_PAYMENT_API_URL = 'http://api.example.com';
      globalThis.fetch.mock.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

      await assert.rejects(
        async () => await processPayment('test_product'),
        { message: 'Network error' }
      );
    });

    it('should throw an error when response is invalid (missing url and success) via processPayment', async () => {
      process.env.VITE_PAYMENT_API_URL = 'http://api.example.com';
      globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ foo: 'bar' })
      }));

      await assert.rejects(
        async () => await processPayment('test_product'),
        { message: 'Invalid response from payment provider: Missing checkout url' }
      );
    });

    it('should throw an error in production without VITE_PAYMENT_API_URL', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      delete process.env.VITE_PAYMENT_API_URL;
      process.env.NODE_ENV = 'production';

      try {
        await assert.rejects(
          async () => await processPayment('test_product'),
          { message: 'Payment API URL is not configured in production environment.' }
        );
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });

  });

  describe('initiateBackendTransaction', () => {
    it('should successfully initiate a transaction when data.success is true', async () => {
      globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, transactionId: 'test-tx-123' })
      }));

      const result = await initiateBackendTransaction('http://test.api', 'test_product');

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.transactionId, 'test-tx-123');
    });

    it('should redirect window when data.url is returned', async () => {
      globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ url: 'https://checkout.stripe.com/test' })
      }));

      // initiateBackendTransaction returns a Promise that never resolves in this case,
      initiateBackendTransaction('http://test.api', 'test_product');

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
        async () => await initiateBackendTransaction('http://test.api', 'test_product'),
        { message: 'API rate limit exceeded' }
      );
    });

    it('should throw an error when response is invalid (missing url and success)', async () => {
      globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ foo: 'bar' })
      }));

      await assert.rejects(
        async () => await initiateBackendTransaction('http://test.api', 'test_product'),
        { message: 'Invalid response from payment provider: Missing checkout url' }
      );
    });

    it('should throw an error when fetch completely fails (network error)', async () => {
      globalThis.fetch.mock.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

      await assert.rejects(
        async () => await initiateBackendTransaction('http://test.api', 'test_product'),
        { message: 'Network error' }
      );
    });
  });

  describe('verifyPaymentSession', () => {
    it('should fall back to simulation mode and return isPaid true for valid IDs', async () => {
      delete process.env.VITE_PAYMENT_API_URL;
      globalThis.sessionStorage.setItem('axim_pending_transaction', 'AXM-123456');
      const result = await verifyPaymentSession('AXM-123456');
      assert.strictEqual(result.isPaid, true);
      assert.strictEqual(globalThis.sessionStorage.getItem('axim_pending_transaction'), null);
    });

    it('should fall back to simulation mode and return isPaid false for valid prefix but mismatching pending transaction', async () => {
      delete process.env.VITE_PAYMENT_API_URL;
      globalThis.sessionStorage.setItem('axim_pending_transaction', 'AXM-OTHER');
      const result = await verifyPaymentSession('AXM-123456');
      assert.strictEqual(result.isPaid, false);
    });

    it('should fall back to simulation mode and return isPaid false for invalid IDs', async () => {
      delete process.env.VITE_PAYMENT_API_URL;
      const result = await verifyPaymentSession('INVALID-ID');
      assert.strictEqual(result.isPaid, false);
    });

    it('should call backend when VITE_PAYMENT_API_URL is configured', async () => {
      process.env.VITE_PAYMENT_API_URL = 'http://api.example.com';
      globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ isPaid: true })
      }));

      const result = await verifyPaymentSession('real-session-id');
      assert.strictEqual(result.isPaid, true);

      // Verify fetch was called correctly
      assert.strictEqual(globalThis.fetch.mock.calls.length, 1);
      const fetchCall = globalThis.fetch.mock.calls[0];
      assert.strictEqual(fetchCall.arguments[0], 'http://api.example.com/verify-session?session_id=real-session-id');
    });

    it('should encode session ID with special characters', async () => {
      process.env.VITE_PAYMENT_API_URL = 'http://api.example.com';
      globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ isPaid: true })
      }));

      const sessionId = 'session&id=injection';
      await verifyPaymentSession(sessionId);

      // Verify fetch was called with encoded parameter
      assert.strictEqual(globalThis.fetch.mock.calls.length, 1);
      const fetchCall = globalThis.fetch.mock.calls[0];
      assert.strictEqual(fetchCall.arguments[0], 'http://api.example.com/verify-session?session_id=session%26id%3Dinjection');
    });

    it('should throw an error when fetch fails to verify', async () => {
      process.env.VITE_PAYMENT_API_URL = 'http://api.example.com';
      globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
        ok: false
      }));

      await assert.rejects(
        async () => await verifyPaymentSession('real-session-id'),
        { message: 'Failed to verify payment session' }
      );
    });

    it('should throw an error in production without VITE_PAYMENT_API_URL', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      delete process.env.VITE_PAYMENT_API_URL;
      process.env.NODE_ENV = 'production';

      try {
        await assert.rejects(
          async () => await verifyPaymentSession('AXM-123456'),
          { message: 'Payment API URL is not configured in production environment.' }
        );
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });
  });
});
