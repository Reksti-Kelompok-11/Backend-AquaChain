const { createClient } = require('@supabase/supabase-js');

// Singleton — satu koneksi dipakai di seluruh app
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = supabase;
