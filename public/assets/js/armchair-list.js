import { escapeHtml } from './utils/dom.js';

function statusText(status) {
  if (status === 'Atrasada') return 'Atrasada';
  if (status === 'Locada') return 'Locada';
  return 'Disponível';
}

function statusBadge(status) {
  if (status === 'Disponível') return `<span class="badge badge--ok">Disponível</span>`;
  if (status === 'Atrasada') return `<span class="badge badge--warn">Atrasada</span>`;
  return `<span class="badge badge--muted">Locada</span>`;
}

function renderDetails(row) {
  const lines = [
    ['Nome', row.name],
    ['Localização', row.location],
    ['Data de alocação', row.allocation_date],
    ['Qtd. de dias', row.rental_days],
    ['Data de devolução', row.return_date],
    ['Status', statusText(row.status)],
  ];

  return `
    <div class="vstack gap-2">
      ${lines
        .map(
          ([label, value]) => `
            <div class="d-flex justify-content-between gap-3">
              <div class="text-secondary">${escapeHtml(label)}</div>
              <div class="text-end">${escapeHtml(value ?? '')}</div>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

export function initArmchairDetailsModal({ onEdit, onDelete } = {}) {
  const modalEl = document.getElementById('armchairDetailsModal');
  const bodyEl = document.getElementById('armchair-details-body');
  const btnEdit = document.getElementById('details-edit');
  const btnDelete = document.getElementById('details-delete');

  if (!modalEl || !bodyEl || !btnEdit || !btnDelete) {
    return { open: () => {} };
  }

  const modal = window.bootstrap?.Modal?.getOrCreateInstance(modalEl);
  let current = null;

  btnEdit.addEventListener('click', () => {
    if (!current) return;
    modal?.hide?.();
    onEdit?.(current);
  });

  btnDelete.addEventListener('click', () => {
    if (!current) return;
    modal?.hide?.();
    onDelete?.(current);
  });

  return {
    open: (row) => {
      current = row;
      bodyEl.innerHTML = renderDetails(row);
      modal?.show?.();
    },
  };
}

export function renderArmchairsList(rows, { onActions } = {}) {
  const root = document.getElementById('armchairs-list');
  if (!root) return;

  if (!rows?.length) {
    root.innerHTML = `<div class="text-secondary">Nenhuma poltrona cadastrada.</div>`;
    return;
  }

  root.innerHTML = rows
    .map(
      (r) => `
        <div class="bg-transparent d-flex justify-content-between align-items-center pb-2 my-2 border-bottom border-1">
          <div class="text-truncate text-white-50" style="max-width: 50%"><strong>${escapeHtml(r.name ?? '')}</strong></div> 
          <div class="text-truncate text-white-50" style="max-width: 70%"><strong>${statusBadge(r.status ?? '')}</strong></div>
          <button class="btn btn-dark btn-sm" type="button" data-action="actions" data-id="${r.id}">
            Detalhes
          </button>
        </div>
      `,
    )
    .join('');

  root.querySelectorAll('button[data-action="actions"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const row = rows.find((x) => x.id === id);
      if (row) onActions?.(row);
    });
  });
}

