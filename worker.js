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
    return env.ASSETS.fetch(request);
  }
};
