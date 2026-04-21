export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      // Route Whitelist Validation
      const allowedRoutes = [
        '/api/create-checkout-session',
        '/api/verify-session',
        '/api/webhooks/stripe',
        '/api/ledger/stamp',
        '/api/send-email',
        '/api/v1/legal-statutes',
        '/api/v1/user/drafts',
        '/api/v1/user/secure-artifacts',
        '/api/v1/telemetry/ingest',
        '/api/v1/telemetry/feedback',
        '/api/v1/user/document-history'
      ];

      const isAllowed = allowedRoutes.some(route => url.pathname.startsWith(route));
      if (!isAllowed) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': url.origin
          }
        });
      }

      // Origin validation
      const allowedOrigins = ['https://quickdemandletter.com', 'http://localhost', 'http://127.0.0.1', 'null'];
      const origin = request.headers.get('Origin');
      if (origin && !allowedOrigins.includes(origin) && !origin.startsWith('http://localhost:')) {
        return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      // Authorization Header Validation
      const authHeader = request.headers.get('Authorization');
      if (authHeader) {
        // Must start with Bearer
        if (!authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Invalid Authorization header format' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const token = authHeader.split(' ')[1];
        // Ensure token has expected shape (JWT structure or axm_live / dev prefix)
        const isAxmToken = token.startsWith('axm_live_') || token.startsWith('dev-token-');
        const isJwt = token.split('.').length === 3;

        if (!isAxmToken && !isJwt) {
          return new Response(JSON.stringify({ error: 'Invalid token structure' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // Ensure the subpath is treated as a path, not a potential URL override
      const subPath = url.pathname.replace(/^\/api\//, '');
      const baseUrl = env.BACKEND_URL.endsWith('/') ? env.BACKEND_URL : `${env.BACKEND_URL}/`;
      const backendUrl = new URL(subPath, baseUrl);
      backendUrl.search = url.search;

      let fetchOptions = {
        method: request.method,
        headers: new Headers(request.headers),
      };

      if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
        if (url.pathname === '/api/create-checkout-session') {
          try {
            const body = await request.clone().json();

            // Inject the correct success and cancel URLs into the payload
            const clientOrigin = request.headers.get('Origin') || url.origin;
            body.success_url = `${clientOrigin}/success?session_id={CHECKOUT_SESSION_ID}`;
            body.cancel_url = `${clientOrigin}/app/demand-generator?canceled=true`;

            fetchOptions.body = JSON.stringify(body);
            // Ensure Content-Type is application/json after modifying the body
            fetchOptions.headers.set('Content-Type', 'application/json');
          } catch (e) {
            console.error('Failed to parse request body for URL injection', e);
            fetchOptions.body = request.clone().body;
          }
        } else if (url.pathname === '/api/ledger/stamp') {
          // Additional logging/processing could be handled here before forwarding
          fetchOptions.body = request.clone().body;
        } else {
            fetchOptions.body = request.clone().body;
        }
      }

      const newRequest = new Request(backendUrl.toString(), fetchOptions);

      try {
        const response = await fetch(newRequest);
        const newResponse = new Response(response.body, response);

        // Ensure CORS headers are correct for the client
        newResponse.headers.set('Access-Control-Allow-Origin', url.origin);
        newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        return newResponse;
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Proxy error', details: err.message }), {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': url.origin
          }
        });
      }
    }

    // Serve assets for all other requests
    const assetResponse = await env.ASSETS.fetch(request);

    // If the asset is not found, and it's a request for a page (not an asset like .js or .css),
    // serve index.html to allow client-side routing to handle it
    if (assetResponse.status === 404 && request.method === 'GET') {
      const isAssetRequest = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i);
      if (!isAssetRequest) {
        const indexRequest = new Request(new URL('/', request.url), request);
        return env.ASSETS.fetch(indexRequest);
      }
    }

    return assetResponse;
  }
};
