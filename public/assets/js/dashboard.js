import { loadAllComponents, showAlert } from './components.js';
import { requireAuth, logout } from './auth.js';
import { listArmchairs, createArmchair, updateArmchair, deleteArmchair } from './armchairs.js';
import { qs } from './utils/dom.js';
import { initArmchairForm } from './form-armchair.js';
import { initSearchToolbar, renderArmchairsTable, getSearchName } from './table-armchairs.js';

await requireAuth();

await loadAllComponents({
  '#header-root': '/components/header.html',
  '#form-root': '/components/armchair-form.html',
  '#table-root': '/components/armchair-table.html',
  '#modal-root': '/components/confirm-modal.html',
});

let editingId = null;
let pendingDeleteId = null;
const form = initArmchairForm({
  onCancel: () => {
    editingId = null;
  },
  onSubmit: async ({ editingId: currentId, payload, ok, errors }) => {
    if (!ok) {
      const first = Object.values(errors)[0];
      showAlert(first || 'Campos inválidos', { variant: 'danger' });
      return;
    }

    try {
      if (!currentId) {
        await createArmchair({
          name: payload.name,
          location: payload.location,
          allocation_date: payload.allocation_date,
          rental_days: Number(payload.rental_days),
          status: payload.status,
        });
        showAlert('Poltrona cadastrada!', { variant: 'ok' });
      } else {
        const updatePayload = {
          name: payload.name,
          location: payload.location,
          allocation_date: payload.allocation_date,
          rental_days: Number(payload.rental_days),
          status: payload.status,
        };
        if (payload.add_days) updatePayload.add_days = Number(payload.add_days);
        await updateArmchair(currentId, updatePayload);
        showAlert('Poltrona atualizada!', { variant: 'ok' });
      }

      editingId = null;
      form.clear();
      await refreshTable();
    } catch (err) {
      showAlert(err.message || 'Erro ao salvar', { variant: 'danger' });
    }
  },
});

async function refreshTable() {
  const name = getSearchName();
  const { data } = await listArmchairs({ name });

  renderArmchairsTable(data || [], {
    onEdit: (row) => {
      editingId = row.id;
      form.fill(row);
    },
    onDelete: (row) => openConfirm(row.id),
  });
}

function openConfirm(id) {
  pendingDeleteId = id;
  const backdrop = qs('#confirm-backdrop');
  backdrop.setAttribute('data-open', 'true');
}

function closeConfirm() {
  pendingDeleteId = null;
  const backdrop = qs('#confirm-backdrop');
  backdrop.setAttribute('data-open', 'false');
}

qs('#btn-logout')?.addEventListener('click', async () => {
  try {
    await logout();
  } finally {
    window.location.href = '/login.html';
  }
});

initSearchToolbar({
  onSearch: async () => {
    try {
      await refreshTable();
    } catch (err) {
      showAlert(err.message || 'Erro ao carregar', { variant: 'danger' });
    }
  },
  onClear: async () => {
    await refreshTable();
  },
});

qs('#confirm-cancel')?.addEventListener('click', () => closeConfirm());
qs('#confirm-backdrop')?.addEventListener('click', (e) => {
  if (e.target?.id === 'confirm-backdrop') closeConfirm();
});
qs('#confirm-ok')?.addEventListener('click', async () => {
  if (!pendingDeleteId) return;
  try {
    await deleteArmchair(pendingDeleteId);
    showAlert('Registro excluído.', { variant: 'ok' });
    closeConfirm();
    await refreshTable();
    if (editingId === pendingDeleteId) {
      editingId = null;
      form.clear();
    }
  } catch (err) {
    showAlert(err.message || 'Erro ao excluir', { variant: 'danger' });
  }
});

form.clear();
await refreshTable();
