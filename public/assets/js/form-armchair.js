import { qs } from './utils/dom.js';
import { computeReturnDate, validateArmchairForm } from './validators.js';

export function initArmchairForm({ onSubmit, onCancel, onHide } = {}) {
  let editingId = null;

  function setFormMode(mode) {
    qs('#form-title').textContent = mode === 'edit' ? 'Editar poltrona' : 'Cadastrar poltrona';
    qs('#btn-submit').textContent = mode === 'edit' ? 'Salvar alterações' : 'Cadastrar';
    qs('#btn-cancel').style.display = mode === 'edit' ? 'inline-flex' : 'none';
    qs('#field-add-days').style.display = mode === 'edit' ? 'block' : 'none';
    if (mode !== 'edit') qs('#add_days').value = '';
  }

  function updatePreview() {
    const allocation_date = qs('#allocation_date').value;
    const rental_days = qs('#rental_days').value;
    const preview = computeReturnDate(allocation_date, rental_days);
    qs('#return_date_preview').textContent = preview || '—';
  }

  function clear() {
    editingId = null;
    setFormMode('create');
    qs('#name').value = '';
    qs('#location').value = '';
    qs('#allocation_date').value = '';
    qs('#rental_days').value = '';
    qs('#add_days').value = '';
    qs('#status').value = 'Disponível';
    updatePreview();
  }

  function fill(row) {
    editingId = row.id;
    setFormMode('edit');
    qs('#name').value = row.name || '';
    qs('#location').value = row.location || '';
    qs('#allocation_date').value = row.allocation_date || '';
    qs('#rental_days').value = row.rental_days ?? '';
    qs('#add_days').value = '';
    qs('#status').value = row.status === 'Atrasada' ? 'Locada' : row.status;
    qs('#return_date_preview').textContent = row.return_date || '—';
  }

  function getPayload() {
    const payload = {
      name: qs('#name').value,
      location: qs('#location').value,
      allocation_date: qs('#allocation_date').value,
      rental_days: qs('#rental_days').value,
      status: qs('#status').value,
    };

    if (editingId) {
      const addDaysValue = qs('#add_days').value;
      if (addDaysValue) payload.add_days = addDaysValue;
    }

    return payload;
  }

  function validate() {
    const payload = getPayload();
    return { payload, ...validateArmchairForm(payload, { partial: false }) };
  }

  qs('#btn-cancel')?.addEventListener('click', () => {
    clear();
    onCancel?.();
  });

  qs('#btn-hide-form')?.addEventListener('click', () => {
    clear();
    onHide?.();
  });

  ['#allocation_date', '#rental_days'].forEach((sel) => {
    qs(sel)?.addEventListener('input', updatePreview);
  });

  qs('#armchair-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    onSubmit?.({ editingId, ...validate() });
  });

  clear();

  return {
    clear,
    fill,
    updatePreview,
    getEditingId: () => editingId,
  };
}
