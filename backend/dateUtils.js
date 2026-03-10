function isValidISODate(value) {
  if (typeof value !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return false;
  return date.toISOString().slice(0, 10) === value;
}

function toISODate(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + Number(days));
  return toISODate(date);
}

function todayISO() {
  return toISODate(new Date());
}

module.exports = { isValidISODate, addDays, toISODate, todayISO };

