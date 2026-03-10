const { supabase } = require('./supabase');
const { addDays, todayISO } = require('./dateUtils');

const TABLE = 'armchairs';

function withDerivedStatus(armchair) {
  if (!armchair) return armchair;
  const today = todayISO();
  if (armchair.status === 'Locada' && armchair.return_date && armchair.return_date < today) {
    return { ...armchair, status: 'Atrasada' };
  }
  return armchair;
}

async function getAllArmchairs({ page = 1, limit = 50, name } = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (name) query = query.ilike('name', `%${name}%`);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data || []).map(withDerivedStatus), count: count || 0 };
}

async function getArmchairById(armchair_id) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', armchair_id).single();
  if (error) throw error;
  return withDerivedStatus(data);
}

async function createArmchair({ name, location, allocation_date, rental_days, status }) {
  const return_date = addDays(allocation_date, rental_days);
  const payload = { name, location, allocation_date, rental_days, return_date, status };

  const { data, error } = await supabase.from(TABLE).insert([payload]).select().single();
  if (error) throw error;
  return withDerivedStatus(data);
}

async function updateArmchair(armchair_id, updates) {
  let next = { ...updates };

  if (updates.add_days !== undefined) {
    const current = await getArmchairById(armchair_id);
    next.rental_days = Number(current.rental_days) + Number(updates.add_days);
    if (!next.allocation_date) next.allocation_date = current.allocation_date;
    delete next.add_days;
  }

  if (next.allocation_date && next.rental_days) {
    next.return_date = addDays(next.allocation_date, next.rental_days);
  } else if (next.allocation_date && next.rental_days === undefined) {
    const current = await getArmchairById(armchair_id);
    next.return_date = addDays(next.allocation_date, current.rental_days);
  } else if (!next.allocation_date && next.rental_days !== undefined) {
    const current = await getArmchairById(armchair_id);
    next.return_date = addDays(current.allocation_date, next.rental_days);
  }

  const { data, error } = await supabase.from(TABLE).update(next).eq('id', armchair_id).select().single();
  if (error) throw error;
  return withDerivedStatus(data);
}

async function deleteArmchair(armchair_id) {
  const { data, error } = await supabase.from(TABLE).delete().eq('id', armchair_id).select().single();
  if (error) throw error;
  return withDerivedStatus(data);
}

module.exports = {
  getAllArmchairs,
  getArmchairById,
  createArmchair,
  updateArmchair,
  deleteArmchair,
};

