import { isValidISODate, addDays } from './utils/date.js';

export function validateArmchairForm(values, { partial = false } = {}) {
  const errors = {};

  if (!partial || values.name !== undefined) {
    if (!values.name?.trim()) errors.name = 'Nome é obrigatório';
  }

  if (!partial || values.location !== undefined) {
    if (!values.location?.trim()) errors.location = 'Localização é obrigatória';
  }

  if (!partial || values.allocation_date !== undefined) {
    if (!values.allocation_date) errors.allocation_date = 'Data é obrigatória';
    else if (!isValidISODate(values.allocation_date)) errors.allocation_date = 'Data inválida';
  }

  if (!partial || values.rental_days !== undefined) {
    const n = Number(values.rental_days);
    if (!Number.isInteger(n)) errors.rental_days = 'Dias deve ser inteiro';
    else if (n <= 0) errors.rental_days = 'Dias deve ser maior que 0';
  }

  if (values.add_days !== undefined && values.add_days !== '') {
    const n = Number(values.add_days);
    if (!Number.isInteger(n)) errors.add_days = 'Dias adicionais deve ser inteiro';
    else if (n <= 0) errors.add_days = 'Dias adicionais deve ser maior que 0';
  }

  if (!partial || values.status !== undefined) {
    if (!values.status) errors.status = 'Status é obrigatório';
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

export function computeReturnDate(allocation_date, rental_days) {
  if (!isValidISODate(allocation_date)) return '';
  const n = Number(rental_days);
  if (!Number.isInteger(n) || n <= 0) return '';
  return addDays(allocation_date, n);
}

