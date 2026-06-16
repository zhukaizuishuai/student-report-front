const BACKEND_URL = 'http://121.199.34.113:8080';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api')) {
      const targetUrl = `${BACKEND_URL}${url.pathname}${url.search}`;
      
      // 构造新的请求头，移除 host 头以避免后端拒绝
      const headers = new Headers(request.headers);
      headers.delete('host');
      headers.set('X-Forwarded-Host', url.host);

      try {
        const response = await fetch(targetUrl, {
          method: request.method,
          headers: headers,
          body: ['GET', 'HEAD'].includes(request.method) ? null : request.body
        });
        return response;
      } catch (err) {
        return new Response(`API proxy error: ${err.message}`, {
          status: 502,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }

    return env.ASSETS.fetch(request);
  }
};
