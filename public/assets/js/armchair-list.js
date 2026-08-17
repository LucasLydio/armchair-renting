import { escapeHtml } from './utils/dom.js';
import { formatDisplayDate } from './utils/date.js';

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
    parts.push(`Olá, ${row.name}! Tudo bem?`);
    parts.push(`Sobre o aluguel da poltrona.`);
  } 
  if (row?.return_date) parts.push(`Devolução prevista: ${formatDisplayDate(row.return_date)}.`);
  if (row?.location) parts.push(`Localização: ${row.location}.`);
  if (row?.status) parts.push(`Situação: ${row.status}.`);
  return parts.join('\n');
}

function openWhatsAppMobile({ waNumber, waText }) {
  const phone = normalizeWhatsAppNumber(waNumber);
  if (!phone) {
    alert('Telefone inválido.');
    return;
  }

  const text = encodeURIComponent(waText || '');
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Deep link (tries to open the app)
  const deepLink = `whatsapp://send?phone=${phone}&text=${text}`;
  // Web fallback
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
    ['Telefone do cliente', row.phone_number],
    ['Data de alocação', formatDisplayDate(row.allocation_date ?? '')],
    ['Qtd. de dias', row.rental_days],
    ['Data de devolução', formatDisplayDate(row.return_date ?? '')],
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
  const btnWhatsApp = document.getElementById('details-whatsapp');

  if (!modalEl || !bodyEl || !btnEdit || !btnDelete) {
    return { open: () => {} };
  }

  const modal = window.bootstrap?.Modal?.getOrCreateInstance(modalEl);
  let current = null;

  btnWhatsApp?.addEventListener('click', () => {
    if (!current?.phone_number) return;
    openWhatsAppMobile({ waNumber: current.phone_number, waText: buildWhatsAppText(current) });
  });

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
      if (btnWhatsApp) btnWhatsApp.style.display = row?.phone_number ? '' : 'none';
      modal?.show?.();
    },
  };
}

function statusBadges(row) {
  if (row.is_most_overdue) return '<div class="status-stack"><span class="badge badge--danger">Mais atrasada</span></div>';
  return `<div class="status-stack">${statusBadge(row.status)}</div>`;
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
        <div class="armchair-list__item bg-transparent d-flex justify-content-between align-items-center pb-2 my-2 border-bottom border-1 ${r.status === 'Atrasada' ? 'armchair-list__item--attention' : ''}">
          <div class="armchair-list__main">
            <div class="text-truncate text-white-50"><strong>${escapeHtml(r.name ?? '')}</strong></div>
            <div class="armchair-list__meta">Devolucao: ${escapeHtml(formatDisplayDate(r.return_date ?? ''))}</div>
          </div>
          <div class="text-truncate text-white-50">${statusBadges(r)}</div>
          <div class="d-flex align-items-center gap-2">
            ${
              r.phone_number
                ? `<button class="btn btn-success btn-sm d-md-none" type="button" data-action="whatsapp" data-id="${r.id}" aria-label="WhatsApp">
                    <i class="bi bi-whatsapp"></i>
                  </button>`
                : ''
            }
            <button class="btn btn-dark btn-sm" type="button" data-action="actions" data-id="${r.id}">
              Detalhes
            </button>
          </div>
        </div>
      `,
    )
    .join('');

  root.querySelectorAll('button[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      const row = rows.find((x) => x.id === id);
      if (!row) return;

      if (action === 'whatsapp') {
        openWhatsAppMobile({ waNumber: row.phone_number, waText: buildWhatsAppText(row) });
        return;
      }

      if (action === 'actions') onActions?.(row);
    });
  });
}
