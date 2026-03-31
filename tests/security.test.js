import { test, describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { initiateBackendTransaction } from '../src/services/paymentService.js';

describe('paymentService security', () => {
  beforeEach(() => {
    // Mock fetch
    globalThis.fetch = mock.fn();

    // Mock window.location
    globalThis.window = {
      location: {
        href: ''
      }
    };
  });

  afterEach(() => {
    delete globalThis.fetch;
    delete globalThis.window;
  });

  it('should throw an error if data.url is not a trusted Stripe domain', async () => {
    globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ url: 'https://malicious-site.com/checkout' })
    }));

    await assert.rejects(
      async () => await initiateBackendTransaction('http://test.api', 'test_product'),
      { message: 'Security Error: Invalid redirect URL' }
    );

    assert.strictEqual(globalThis.window.location.href, '');
  });

  it('should throw an error if data.url is not https', async () => {
    globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ url: 'http://checkout.stripe.com/checkout' })
    }));

    await assert.rejects(
      async () => await initiateBackendTransaction('http://test.api', 'test_product'),
      { message: 'Security Error: Invalid redirect URL' }
    );

    assert.strictEqual(globalThis.window.location.href, '');
  });

  it('should allow trusted Stripe domains', async () => {
    const trustedUrl = 'https://checkout.stripe.com/c/pay/test';
    globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ url: trustedUrl })
    }));

    // initiateBackendTransaction returns a Promise that never resolves on success redirect
    // We don't await it because it never resolves
    initiateBackendTransaction('http://test.api', 'test_product');

    // Wait a tick for the microtask queue to process the fetch fulfillment
    await new Promise(resolve => setTimeout(resolve, 50));

    assert.strictEqual(globalThis.window.location.href, trustedUrl);
  });

  it('should allow stripe.com main domain', async () => {
    const trustedUrl = 'https://stripe.com/any-path';
    globalThis.fetch.mock.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ url: trustedUrl })
    }));

    initiateBackendTransaction('http://test.api', 'test_product');

    await new Promise(resolve => setTimeout(resolve, 50));

    assert.strictEqual(globalThis.window.location.href, trustedUrl);
  });
});
