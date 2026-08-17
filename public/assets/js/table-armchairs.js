import { formatDisplayDate } from './utils/date.js';
import { escapeHtml } from './utils/dom.js';

function normalizeWhatsAppNumber(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (!digits) return '';

  // Default to Brazil if the user typed a local number (10/11 digits).
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;

  return digits;
}

function buildWhatsAppText(row) {
  const parts = [''];
  if (row?.name) {
    parts.push(`Ola, ${row.name}! Tudo bem?`);
    parts.push('Sobre o aluguel da poltrona.');
  }
  if (row?.return_date) parts.push(`Devolucao prevista: ${formatDisplayDate(row.return_date)}.`);
  if (row?.location) parts.push(`Localizacao: ${row.location}.`);
  if (row?.status) parts.push(`Situacao: ${row.status}.`);
  return parts.join('\n');
}

function openWhatsAppMobile({ waNumber, waText }) {
  const phone = normalizeWhatsAppNumber(waNumber);
  if (!phone) {
    alert('Telefone invalido.');
    return;
  }

  const text = encodeURIComponent(waText || '');
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const deepLink = `whatsapp://send?phone=${phone}&text=${text}`;
  const webLink = `https://wa.me/${phone}?text=${text}`;

  if (!isMobile) {
    window.open(webLink, '_blank', 'noopener');
    return;
  }

  window.location.href = deepLink;
  setTimeout(() => {
    window.location.href = webLink;
  }, 1400);
}

function statusBadge(status) {
  if (status === 'Disponível') return `<span class="badge badge--ok">Disponível</span>`;
  if (status === 'Atrasada') return `<span class="badge badge--warn">Atrasada</span>`;
  return `<span class="badge badge--muted">Locada</span>`;
}

function statusBadges(row) {
  if (row.is_most_overdue) return '<div class="status-stack"><span class="badge badge--danger">Mais atrasada</span></div>';
  return `<div class="status-stack">${statusBadge(row.status)}</div>`;
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
        <tr data-id="${r.id}" class="${r.status === 'Atrasada' ? 'table__row--attention' : ''}">
          <td>${escapeHtml(r.name ?? '')}</td>
          <td>${escapeHtml(r.location ?? '')}</td>
          <td>${escapeHtml(r.phone_number ?? '')}</td>
          <td>${formatDisplayDate(r.allocation_date ?? '')}</td>
          <td>${escapeHtml(r.rental_days ?? '')}</td>
          <td>${formatDisplayDate(r.return_date ?? '')}</td>
          <td>${statusBadges(r)}</td>
          <td class="table__actions">
            <div class="actions">
              <button class="btn btn--ghost" data-action="edit" type="button">
                <i class="bi bi-pencil-square text-success"></i>
              </button>
              <button class="btn btn--danger" data-action="delete" type="button">
                <i class="bi bi-trash3-fill text-danger"></i>
              </button>
              ${
                r.phone_number
                  ? `<button class="btn btn-success btn-sm" type="button" data-action="whatsapp" data-id="${r.id}" aria-label="WhatsApp">
                      <i class="bi bi-whatsapp"></i>
                    </button>`
                  : ''
              }
            </div>
          </td>
        </tr>
      `,
          )
          .join('')
      : `<tr><td colspan="8" class="muted">Nenhuma poltrona cadastrada.</td></tr>`;

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
      if (action === 'whatsapp') {
        openWhatsAppMobile({ waNumber: row.phone_number, waText: buildWhatsAppText(row) });
      }
    });
  });
}
