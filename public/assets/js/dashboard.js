import { loadAllComponents, showAlert } from './components.js';
import { requireAuth, logout } from './auth.js';
import { listArmchairs, createArmchair, updateArmchair, deleteArmchair } from './armchairs.js';
import { qs } from './utils/dom.js';
import { initArmchairForm } from './form-armchair.js';
import { initSearchToolbar, renderArmchairsTable, getSearchName, setSearchName } from './table-armchairs.js';
import { initArmchairDetailsModal, renderArmchairsList } from './armchair-list.js';

await requireAuth();

await loadAllComponents({
  '#header-root': '/components/header.html',
  '#form-root': '/components/armchair-form.html',
  '#table-root': '/components/armchair-table.html',
  '#list-root': '/components/armchair-list.html',
  '#modal-root': '/components/confirm-modal.html',
});

let editingId = null;
let pendingDeleteId = null;

let currentPage = 1;
let pageSize = 5;
let totalCount = 0;

function totalPages() {
  return Math.max(1, Math.ceil((totalCount || 0) / pageSize));
}

function clampPage() {
  currentPage = Math.max(1, Math.min(currentPage, totalPages()));
}

function showForm() {
  qs('#form-root')?.classList.remove('is-hidden');
  qs('#form-root')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideForm() {
  qs('#form-root')?.classList.add('is-hidden');
}

function setSearchAll(value) {
  setSearchName('search-name-table', value);
  setSearchName('search-name-list', value);
}

function getSearchAny() {
  return getSearchName('search-name-list') || getSearchName('search-name-table') || '';
}

function syncPageSizeSelects(value) {
  const v = String(value);
  const a = document.getElementById('page-size-table');
  const b = document.getElementById('page-size-list');
  if (a) a.value = v;
  if (b) b.value = v;
}

function updatePaginationUI(prefix) {
  const info = document.getElementById(`pagination-info-${prefix}`);
  const prev = document.getElementById(`page-prev-${prefix}`);
  const next = document.getElementById(`page-next-${prefix}`);

  const pages = totalPages();
  clampPage();

  if (prev) prev.disabled = currentPage <= 1;
  if (next) next.disabled = currentPage >= pages;

  if (!info) return;
  if (!totalCount) {
    info.textContent = '0 resultados';
    return;
  }

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalCount);
  info.textContent = `Mostrando ${from}–${to} de ${totalCount} • Página ${currentPage} de ${pages}`;
}

async function refreshData({ name } = {}) {
  const q = name ?? getSearchAny();
  const res = await listArmchairs({ name: q, page: currentPage, limit: pageSize });
  const rows = res?.data || [];
  totalCount = Number(res?.count || 0);

  clampPage();

  renderArmchairsTable(rows, {
    tbodyId: 'armchairs-tbody-table',
    onEdit: (row) => {
      editingId = row.id;
      showForm();
      form.fill(row);
    },
    onDelete: (row) => openConfirm(row.id),
  });

  renderArmchairsList(rows, {
    onActions: (row) => detailsModal.open(row),
  });

  updatePaginationUI('table');
  updatePaginationUI('list');
}

function initPagination(prefix) {
  const prev = document.getElementById(`page-prev-${prefix}`);
  const next = document.getElementById(`page-next-${prefix}`);
  const size = document.getElementById(`page-size-${prefix}`);

  prev?.addEventListener('click', async () => {
    if (currentPage <= 1) return;
    currentPage -= 1;
    await refreshData();
  });

  next?.addEventListener('click', async () => {
    if (currentPage >= totalPages()) return;
    currentPage += 1;
    await refreshData();
  });

  size?.addEventListener('change', async () => {
    const nextSize = Number(size.value) || 5;
    pageSize = nextSize;
    syncPageSizeSelects(nextSize);
    currentPage = 1;
    await refreshData();
  });
}

const form = initArmchairForm({
  onCancel: () => {
    editingId = null;
  },
  onHide: () => {
    editingId = null;
    hideForm();
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
      hideForm();
      await refreshData();
    } catch (err) {
      showAlert(err.message || 'Erro ao salvar', { variant: 'danger' });
    }
  },
});

const detailsModal = initArmchairDetailsModal({
  onEdit: (row) => {
    editingId = row.id;
    showForm();
    form.fill(row);
  },
  onDelete: (row) => openConfirm(row.id),
});

function openConfirm(id) {
  pendingDeleteId = id;
  qs('#confirm-backdrop')?.setAttribute('data-open', 'true');
}

function closeConfirm() {
  pendingDeleteId = null;
  qs('#confirm-backdrop')?.setAttribute('data-open', 'false');
}

qs('#btn-logout')?.addEventListener('click', async () => {
  try {
    await logout();
  } finally {
    window.location.href = '/login.html';
  }
});

initSearchToolbar({
  formId: 'search-form-table',
  inputId: 'search-name-table',
  clearId: 'btn-clear-table',
  onSearch: async (value) => {
    try {
      setSearchAll(value);
      currentPage = 1;
      await refreshData();
    } catch (err) {
      showAlert(err.message || 'Erro ao carregar', { variant: 'danger' });
    }
  },
  onClear: async () => {
    setSearchAll('');
    currentPage = 1;
    await refreshData({ name: '' });
  },
});

initSearchToolbar({
  formId: 'search-form-list',
  inputId: 'search-name-list',
  clearId: 'btn-clear-list',
  onSearch: async (value) => {
    try {
      setSearchAll(value);
      currentPage = 1;
      await refreshData();
    } catch (err) {
      showAlert(err.message || 'Erro ao carregar', { variant: 'danger' });
    }
  },
  onClear: async () => {
    setSearchAll('');
    currentPage = 1;
    await refreshData({ name: '' });
  },
});

['btn-open-form-table', 'btn-open-form-list'].forEach((id) => {
  document.getElementById(id)?.addEventListener('click', () => {
    editingId = null;
    form.clear();
    showForm();
  });
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

    if (totalCount && (totalCount - 1) <= (currentPage - 1) * pageSize && currentPage > 1) {
      currentPage -= 1;
    }

    await refreshData();

    if (editingId === pendingDeleteId) {
      editingId = null;
      form.clear();
      hideForm();
    }
  } catch (err) {
    showAlert(err.message || 'Erro ao excluir', { variant: 'danger' });
  }
});

syncPageSizeSelects(pageSize);
initPagination('table');
initPagination('list');

form.clear();
hideForm();
await refreshData();

