export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      const backendUrl = new URL(url.pathname.replace(/^\/api/, ''), 'https://axim-payment-backend.jrellars.workers.dev');
      backendUrl.search = url.search;

      const newRequest = new Request(backendUrl.toString(), request);

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
