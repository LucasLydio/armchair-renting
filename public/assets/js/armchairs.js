import { apiFetch } from './api.js';

export async function listArmchairs({ page = 1, limit = 50, name } = {}) {
  return apiFetch('armchairs-get', { method: 'GET', query: { page, limit, name } });
}

export async function createArmchair(payload) {
  return apiFetch('armchairs-create', { method: 'POST', body: payload });
}

export async function updateArmchair(id, payload) {
  return apiFetch('armchairs-update', { method: 'PATCH', query: { armchair_id: id }, body: payload });
}

export async function deleteArmchair(id) {
  return apiFetch('armchairs-delete', { method: 'DELETE', query: { armchair_id: id } });
}

