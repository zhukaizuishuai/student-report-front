const BACKEND_URL = 'http://121.199.34.113:8080';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const targetUrl = `${BACKEND_URL}${url.pathname}${url.search}`;

  return fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body
  });
}
