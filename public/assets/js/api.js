export async function apiFetch(fnName, { method = 'GET', query, body } = {}) {
  const url = new URL(`/.netlify/functions/${fnName}`, window.location.origin);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue;
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = typeof data === 'object' && data?.error ? data.error : 'Erro na requisição';
    const err = new Error(message);
    err.status = res.status;
    err.details = typeof data === 'object' ? data?.details : null;
    throw err;
  }

  return data;
}

