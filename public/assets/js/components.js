export async function loadComponent(el, url) {
  const res = await fetch(url, { cache: 'no-store' });
  el.innerHTML = await res.text();
}

export async function loadAllComponents(map) {
  await Promise.all(
    Object.entries(map).map(async ([selector, url]) => {
      const el = document.querySelector(selector);
      if (!el) return;
      await loadComponent(el, url);
    }),
  );
}

export function showAlert(message, { variant = 'danger', timeoutMs = 3500 } = {}) {
  const root = document.querySelector('#alert-root');
  if (!root) return;

  const klass = variant === 'ok' ? 'alert alert--ok' : 'alert alert--danger';
  root.innerHTML = `<div class="${klass}">${message}</div>`;
  if (timeoutMs) setTimeout(() => (root.innerHTML = ''), timeoutMs);
}

