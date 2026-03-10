import { qs } from './utils/dom.js';

function statusBadge(status) {
  if (status === 'Disponível') return `<span class="badge badge--ok">Disponível</span>`;
  if (status === 'Atrasada') return `<span class="badge badge--warn">Atrasada</span>`;
  return `<span class="badge badge--muted">Locada</span>`;
}

export function getSearchName() {
  return qs('#search-name')?.value || '';
}

export function initSearchToolbar({ onSearch, onClear } = {}) {
  qs('#search-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    onSearch?.(getSearchName());
  });

  qs('#btn-clear')?.addEventListener('click', () => {
    qs('#search-name').value = '';
    onClear?.();
  });
}

export function renderArmchairsTable(rows, { onEdit, onDelete } = {}) {
  const tbody = qs('#armchairs-tbody');
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
              <button class="btn btn--ghost" data-action="edit" type="button">Editar</button>
              <button class="btn btn--danger" data-action="delete" type="button">Excluir</button>
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

