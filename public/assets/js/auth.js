import { apiFetch } from './api.js';

export async function login(username, password) {
  return apiFetch('login', { method: 'POST', body: { username, password } });
}

export async function logout() {
  return apiFetch('logout', { method: 'POST' });
}

export async function getSession() {
  return apiFetch('get-session', { method: 'GET' });
}

export async function requireAuth() {
  const { session } = await getSession();
  if (!session) {
    window.location.href = '/login.html';
    return null;
  }
  return session;
}

export async function redirectIfLogged() {
  const { session } = await getSession();
  if (session) window.location.href = '/dashboard.html';
}

