import { loadAllComponents, showAlert } from './components.js';
import { login, redirectIfLogged } from './auth.js';
import { qs } from './utils/dom.js';

await redirectIfLogged();

await loadAllComponents({
  '#login-root': '/components/login-form.html',
});

const form = qs('#login-form');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = qs('#username')?.value || '';
  const password = qs('#password')?.value || '';

  try {
    await login(username, password);
    window.location.href = '/dashboard.html';
  } catch (err) {
    showAlert(err.message || 'Erro ao logar', { variant: 'danger' });
  }
});

