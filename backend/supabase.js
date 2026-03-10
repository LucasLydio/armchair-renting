const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error('Missing env SUPABASE_URL');
if (!supabaseKey) {
  throw new Error('Missing env SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

module.exports = { supabase };

