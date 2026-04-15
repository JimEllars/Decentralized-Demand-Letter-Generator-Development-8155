export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      // Ensure the subpath is treated as a path, not a potential URL override
      // We strip all leading slashes and then prepend './' to ensure it is
      // interpreted as a relative path component.
      const subPath = './' + url.pathname.replace(/^\/api/, '').replace(/^\/+/, '');

      // Ensure backendUrl has a trailing slash for proper relative joining
      const baseUrl = env.BACKEND_URL.endsWith('/') ? env.BACKEND_URL : `${env.BACKEND_URL}/`;
      const backendUrl = new URL(subPath, baseUrl);
      backendUrl.search = url.search;

      let fetchOptions = {
        method: request.method,
        headers: new Headers(request.headers),
      };

      // Override headers to ensure backend sees the correct origin
      fetchOptions.headers.set('Origin', 'https://quickdemandletter.com');
      fetchOptions.headers.set('Referer', 'https://quickdemandletter.com/');

      if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
        if (url.pathname === '/api/create-checkout-session') {
          try {
            const body = await request.clone().json();

            // Inject the correct success and cancel URLs into the payload
            body.success_url = 'https://quickdemandletter.com/success?session_id={CHECKOUT_SESSION_ID}';
            body.cancel_url = 'https://quickdemandletter.com/app/demand-generator?canceled=true';

            fetchOptions.body = JSON.stringify(body);
            // Ensure Content-Type is application/json after modifying the body
            fetchOptions.headers.set('Content-Type', 'application/json');
          } catch (e) {
            console.error('Failed to parse request body for URL injection', e);
            fetchOptions.body = request.clone().body;
          }
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
        newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');

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
