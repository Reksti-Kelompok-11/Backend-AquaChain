const { v4: uuidv4 } = require('uuid');
const supabase = require('../services/supabaseService');

/**
 * GET /api/ponds
 * Daftar semua kolam.
 */
exports.getAllPonds = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('ponds')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);

  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/ponds/:pondId
 * Detail satu kolam.
 */
exports.getPondById = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('ponds')
      .select('*')
      .eq('pond_id', req.params.pondId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Pond not found' });

    res.json(data);

  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/ponds
 * Daftarkan kolam baru.
 */
exports.createPond = async (req, res, next) => {
  try {
    const { name, fish_type, capacity } = req.body;

    if (!name || !fish_type || !capacity) {
      return res.status(400).json({ error: 'Missing required fields: name, fish_type, capacity' });
    }

    const { data, error } = await supabase
      .from('ponds')
      .insert({
        pond_id:    uuidv4(),
        name,
        fish_type,
        capacity,
        status:     'active',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);

  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/ponds/:pondId/status
 * Update status kolam (active / inactive / maintenance).
 */
exports.updatePondStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed    = ['active', 'inactive', 'maintenance'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Status harus salah satu: ${allowed.join(', ')}` });
    }

    const { data, error } = await supabase
      .from('ponds')
      .update({ status })
      .eq('pond_id', req.params.pondId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);

  } catch (err) {
    next(err);
  }
};
