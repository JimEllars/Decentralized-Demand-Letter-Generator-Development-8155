import { test, describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import worker from '../worker.js';

describe('Cloudflare Worker API Proxy', () => {
  const mockEnv = {
    BACKEND_URL: 'https://api.trusted-backend.com',
    ASSETS: {
      fetch: mock.fn(() => Promise.resolve(new Response('Asset content', { status: 200 })))
    }
  };

  beforeEach(() => {
    globalThis.fetch = mock.fn(() => Promise.resolve(new Response('OK', { status: 200 })));
    globalThis.Request = class {
      constructor(input, options) {
        this.url = input;
        this.method = options?.method || 'GET';
        this.headers = options?.headers || new Headers();
        this.body = options?.body || null;
      }
      clone() {
        return {
          json: () => Promise.resolve({}),
          body: this.body
        };
      }
    };
    globalThis.Response = class {
      constructor(body, options) {
        this.body = body;
        this.status = options?.status || 200;
        this.headers = new Map(Object.entries(options?.headers || {}));
      }
    };
    globalThis.Headers = class {
        constructor(init) {
            if (init instanceof Headers) {
                this.map = new Map(init.map);
            } else if (init && typeof init[Symbol.iterator] === 'function') {
                this.map = new Map(init);
            } else {
                this.map = new Map(Object.entries(init || {}));
            }
        }
        set(key, value) {
            this.map.set(key.toLowerCase(), value);
        }
        get(key) {
            return this.map.get(key.toLowerCase());
        }
        *[Symbol.iterator]() {
            yield* this.map.entries();
        }
    };
  });

  afterEach(() => {
    delete globalThis.fetch;
    delete globalThis.Request;
    delete globalThis.Response;
    delete globalThis.Headers;
  });

  it('should proxy /api requests to BACKEND_URL', async () => {
    const request = new Request('https://quickdemandletter.com/api/test', {
      method: 'GET',
      headers: new Headers()
    });

    await worker.fetch(request, mockEnv);

    const fetchCall = globalThis.fetch.mock.calls[0];
    const proxiedRequest = fetchCall.arguments[0];

    assert.strictEqual(proxiedRequest.url, 'https://api.trusted-backend.com/test');
  });

  it('should handle missing BACKEND_URL gracefully (test URL constructor behavior)', async () => {
    const request = new Request('https://quickdemandletter.com/api/test', {
      method: 'GET',
      headers: new Headers()
    });

    // If BACKEND_URL is undefined, URL constructor will throw
    await assert.rejects(
      async () => await worker.fetch(request, {}),
      TypeError
    );
  });

  it('should pass Original Headers through and not spoof Origin/Referer', async () => {
    const initialHeaders = new Headers();
    initialHeaders.set('Origin', 'https://attacker.com');
    initialHeaders.set('Referer', 'https://attacker.com/malicious');
    initialHeaders.set('X-Custom-Header', 'custom-value');

    const request = new Request('https://quickdemandletter.com/api/test', {
      method: 'POST',
      headers: initialHeaders
    });

    await worker.fetch(request, mockEnv);

    const fetchCall = globalThis.fetch.mock.calls[0];
    const proxiedRequest = fetchCall.arguments[0];

    assert.strictEqual(proxiedRequest.headers.get('Origin'), 'https://attacker.com');
    assert.strictEqual(proxiedRequest.headers.get('Referer'), 'https://attacker.com/malicious');
    assert.strictEqual(proxiedRequest.headers.get('X-Custom-Header'), 'custom-value');
  });
});
