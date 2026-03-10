const { isValidISODate } = require('./dateUtils');

const ALLOWED_STATUS = ['Disponível', 'Locada'];

function asTrimmedString(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asInt(value) {
  const n = Number(value);
  if (!Number.isInteger(n)) return null;
  return n;
}

function validateArmchairPayload(payload, { partial = false } = {}) {
  const errors = {};
  const value = {};

  const name = asTrimmedString(payload?.name);
  const location = asTrimmedString(payload?.location);
  const allocation_date = asTrimmedString(payload?.allocation_date);
  const rental_days = payload?.rental_days !== undefined ? asInt(payload.rental_days) : null;
  const add_days = payload?.add_days !== undefined ? asInt(payload.add_days) : null;
  const status = asTrimmedString(payload?.status);

  if (!partial || payload?.name !== undefined) {
    if (!name) errors.name = 'Nome é obrigatório';
    else value.name = name;
  }

  if (!partial || payload?.location !== undefined) {
    if (!location) errors.location = 'Localização é obrigatória';
    else value.location = location;
  }

  if (!partial || payload?.allocation_date !== undefined) {
    if (!allocation_date) errors.allocation_date = 'Data de alocação é obrigatória';
    else if (!isValidISODate(allocation_date)) errors.allocation_date = 'Data inválida (use YYYY-MM-DD)';
    else value.allocation_date = allocation_date;
  }

  if (!partial || payload?.rental_days !== undefined) {
    if (rental_days === null) errors.rental_days = 'Quantidade de dias deve ser um inteiro';
    else if (rental_days <= 0) errors.rental_days = 'Quantidade de dias deve ser maior que 0';
    else value.rental_days = rental_days;
  }

  if (payload?.add_days !== undefined) {
    if (add_days === null) errors.add_days = 'Dias adicionais deve ser um inteiro';
    else if (add_days <= 0) errors.add_days = 'Dias adicionais deve ser maior que 0';
    else value.add_days = add_days;
  }

  if (!partial || payload?.status !== undefined) {
    if (!status) errors.status = 'Status é obrigatório';
    else if (!ALLOWED_STATUS.includes(status)) errors.status = `Status inválido (${ALLOWED_STATUS.join(' | ')})`;
    else value.status = status;
  }

  return { value, errors, ok: Object.keys(errors).length === 0 };
}

module.exports = { validateArmchairPayload, ALLOWED_STATUS };

