function statusBadge(status) {
  if (status === 'Disponível') return `<span class="badge badge--ok">Disponível</span>`;
  if (status === 'Atrasada') return `<span class="badge badge--warn">Atrasada</span>`;
  return `<span class="badge badge--muted">Locada</span>`;
}

export function getSearchName(inputId) {
  return document.getElementById(inputId)?.value || '';
}

export function setSearchName(inputId, value) {
  const el = document.getElementById(inputId);
  if (el) el.value = value;
}

export function initSearchToolbar({ formId, inputId, clearId, onSearch, onClear } = {}) {
  const form = document.getElementById(formId);
  const input = document.getElementById(inputId);
  const clear = document.getElementById(clearId);

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    onSearch?.(input?.value || '');
  });

  clear?.addEventListener('click', () => {
    if (input) input.value = '';
    onClear?.();
  });
}

export function renderArmchairsTable(rows, { tbodyId, onEdit, onDelete } = {}) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  tbody.innerHTML =
    rows?.length
      ? rows
          .map(
            (r) => `
        <tr data-id="${r.id}">
          <td>${r.name ?? ''}</td>
          <td>${r.location ?? ''}</td>
          <td>${r.allocation_date ?? ''}</td>
          <td>${r.rental_days ?? ''}</td>
          <td>${r.return_date ?? ''}</td>
          <td>${statusBadge(r.status)}</td>
          <td class="table__actions">
            <div class="actions">
              <button class="btn btn--ghost" data-action="edit" type="button">
                <i class="bi bi-pencil-square text-success"></i>
              </button>
              <button class="btn btn--danger" data-action="delete" type="button">
                <i class="bi bi-trash3 text-danger"></i>
              </button>
            </div>
          </td>
        </tr>
      `,
          )
          .join('')
      : `<tr><td colspan="7" class="muted">Nenhuma poltrona cadastrada.</td></tr>`;

  tbody.querySelectorAll('tr[data-id]').forEach((tr) => {
    tr.addEventListener('click', (e) => {
      const btn = e.target?.closest('button[data-action]');
      if (!btn) return;
      const id = tr.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      const row = rows.find((x) => x.id === id);
      if (!row) return;
      if (action === 'edit') onEdit?.(row);
      if (action === 'delete') onDelete?.(row);
    });
  });
}

