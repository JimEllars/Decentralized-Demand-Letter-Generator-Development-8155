import { test, describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { verifyPaymentSession, getValidAccessToken, clearAccessToken } from '../src/services/paymentService.js';

describe('Payment Token Security', () => {
  let originalSessionStorage;

  beforeEach(() => {
    originalSessionStorage = globalThis.sessionStorage;
    // Mock sessionStorage
    const store = new Map();
    const mockStorage = {
      setItem: mock.fn((key, value) => store.set(key, value)),
      getItem: mock.fn((key) => store.get(key) || null),
      removeItem: mock.fn((key) => store.delete(key)),
      clear: mock.fn(() => store.clear())
    };
    Object.defineProperty(globalThis, 'sessionStorage', { value: mockStorage, writable: true, configurable: true });

    // In our test, import.meta is read-only, but we can simulate the environment variables via process.env

    // Mock crypto.randomUUID safely
    if (!globalThis.crypto) {
      globalThis.crypto = { randomUUID: () => 'test-uuid-1234' };
    } else {
      try {
        mock.method(globalThis.crypto, 'randomUUID', () => 'test-uuid-1234');
      } catch (e) {
        // Fallback if randomUUID is read-only
        const oldCrypto = globalThis.crypto;
        globalThis.crypto = { ...oldCrypto, randomUUID: () => 'test-uuid-1234' };
      }
    }

    // Configure production API since simulation mode is deprecated
    process.env.VITE_PAYMENT_API_URL = 'http://api.example.com';
    process.env.NODE_ENV = 'production';

    // Mock fetch for verifyPaymentSession
    globalThis.fetch = mock.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        isPaid: true,
        accessToken: 'dev-token-test-uuid-1234',
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      })
    }));

    // Clear any existing tokens
    clearAccessToken();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'sessionStorage', { value: originalSessionStorage, writable: true, configurable: true });
    delete globalThis.fetch;
  });

  it('should store tokens in sessionStorage when verifyPaymentSession is called via API', async () => {
    const sessionId = 'AXM-12345';

    const result = await verifyPaymentSession(sessionId);

    assert.strictEqual(result.isPaid, true, 'Payment should be marked as paid');
    assert.ok(result.accessToken, 'Access token should be returned');

    // VERIFY: Token SHOULD be in sessionStorage (since simulation memory store was removed)
    assert.strictEqual(sessionStorage.getItem('axim_access_token'), 'dev-token-test-uuid-1234', 'Token should be in sessionStorage');
    assert.ok(sessionStorage.getItem('axim_token_expiry'), 'Expiry should be in sessionStorage');

    // VERIFY: getValidAccessToken should retrieve from sessionStorage
    const token = getValidAccessToken();
    assert.strictEqual(token, result.accessToken, 'getValidAccessToken should return the token from sessionStorage');
  });

  it('should clear token from sessionStorage when clearAccessToken is called', async () => {
    const sessionId = 'AXM-12345';

    await verifyPaymentSession(sessionId);
    assert.ok(getValidAccessToken(), 'Token should exist before clearing');

    clearAccessToken();
    assert.strictEqual(getValidAccessToken(), null, 'Token should be null after clearing');
    assert.strictEqual(sessionStorage.getItem('axim_access_token'), null);
  });

  it('should fallback to sessionStorage if in-memory token is missing (for production use case)', async () => {
    const mockProdToken = 'prod-token-xyz';
    const futureDate = new Date(Date.now() + 3600000).toISOString();

    sessionStorage.setItem('axim_access_token', mockProdToken);
    sessionStorage.setItem('axim_token_expiry', futureDate);

    const token = getValidAccessToken();
    assert.strictEqual(token, mockProdToken, 'Should retrieve token from sessionStorage if memory is empty');
  });
});
