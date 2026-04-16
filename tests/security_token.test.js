import { test, describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { verifyPaymentSession, getValidAccessToken, clearAccessToken } from '../src/services/paymentService.js';

describe('Payment Token Security', () => {
  beforeEach(() => {
    // Mock sessionStorage
    const store = new Map();
    globalThis.sessionStorage = {
      setItem: mock.fn((key, value) => store.set(key, value)),
      getItem: mock.fn((key) => store.get(key) || null),
      removeItem: mock.fn((key) => store.delete(key)),
      clear: mock.fn(() => store.clear())
    };

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

    // Ensure we are in simulation mode (no VITE_PAYMENT_API_URL)
    delete process.env.VITE_PAYMENT_API_URL;

    // Clear any existing tokens
    clearAccessToken();
  });

  it('should store simulation tokens in memory and NOT in sessionStorage', async () => {
    const sessionId = 'AXM-12345';
    sessionStorage.setItem('axim_pending_transaction', sessionId);

    const result = await verifyPaymentSession(sessionId);

    assert.strictEqual(result.isPaid, true, 'Payment should be marked as paid');
    assert.ok(result.accessToken, 'Access token should be returned');

    // VERIFY: Token should NOT be in sessionStorage
    assert.strictEqual(sessionStorage.getItem('axim_access_token'), null, 'Token should NOT be in sessionStorage');
    assert.strictEqual(sessionStorage.getItem('axim_token_expiry'), null, 'Expiry should NOT be in sessionStorage');

    // VERIFY: getValidAccessToken should still work (retrieving from memory)
    const token = getValidAccessToken();
    assert.strictEqual(token, result.accessToken, 'getValidAccessToken should return the in-memory token');
  });

  it('should clear in-memory token when clearAccessToken is called', async () => {
    const sessionId = 'AXM-12345';
    sessionStorage.setItem('axim_pending_transaction', sessionId);

    await verifyPaymentSession(sessionId);
    assert.ok(getValidAccessToken(), 'Token should exist before clearing');

    clearAccessToken();
    assert.strictEqual(getValidAccessToken(), null, 'Token should be null after clearing');
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
