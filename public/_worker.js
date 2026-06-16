const BACKEND_URL = 'http://121.199.34.113:8080';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api')) {
      return fetch(`${BACKEND_URL}${url.pathname}${url.search}`, {
        method: request.method,
        headers: request.headers,
        body: ['GET', 'HEAD'].includes(request.method) ? null : request.body
      });
    }

    return env.ASSETS.fetch(request);
  }
};
