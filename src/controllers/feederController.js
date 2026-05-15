const { v4: uuidv4 } = require('uuid');
const supabase = require('../services/supabaseService');

/**
 * GET /api/feeder/:pondId/schedules
 * Ambil jadwal pakan aktif untuk kolam tertentu.
 */
exports.getSchedules = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('feeding_schedules')
      .select('*')
      .eq('pond_id', req.params.pondId)
      .eq('is_active', true)
      .order('time', { ascending: true });

    if (error) throw error;
    res.json(data);

  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/feeder/:pondId/schedules
 * Ambil jadwal pakan aktif untuk kolam tertentu.
 */
exports.getAllSchedules = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('feeding_schedules')
      .select('*')
      .order('time', { ascending: true });

    if (error) throw error;
    res.json(data);

  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/feeder/schedules
 * Buat jadwal pakan baru.
 */
exports.createSchedule = async (req, res, next) => {
  try {
    const { pond_id, time, dosage } = req.body;

    if (!pond_id || !time || dosage == null) {
      return res.status(400).json({ error: 'Missing required fields: pond_id, time, dosage' });
    }

    const { data, error } = await supabase
      .from('feeding_schedules')
      .insert({ schedule_id: uuidv4(), pond_id, time, dosage, is_active: true })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);

  } catch (err) {
    next(err);
  }
};



/**
 * PATCH /api/feeder/schedules/:scheduleId/deactivate
 * Nonaktifkan jadwal pakan.
 */
exports.deactivateSchedule = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('feeding_schedules')
      .update({ is_active: false })
      .eq('schedule_id', req.params.scheduleId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);

  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/feeder/schedules/:scheduleId
 * Hapus jadwal pakan.
 */
exports.deleteSchedule = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('feeding_schedules')
      .delete()
      .eq('schedule_id', req.params.scheduleId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);

  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/feeder/schedules/:scheduleId/activate
 * Aktifkan jadwal pakan.
 */
exports.activateSchedule = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('feeding_schedules')
      .update({ is_active: true })
      .eq('schedule_id', req.params.scheduleId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);

  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/feeder/logs
 * Catat hasil eksekusi pemberian pakan oleh ESP32.
 */
exports.createFeedingLog = async (req, res, next) => {
  try {
    const { pond_id, scheduled_time, actual_time, target_dosage, actual_dosage, status, trigger_reason } = req.body;

    const { data, error } = await supabase
      .from('feeding_logs')
      .insert({
        log_id: uuidv4(),
        pond_id,
        scheduled_time,
        actual_time,
        target_dosage,
        actual_dosage,
        status,
        trigger_reason,
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
 * GET /api/feeder/:pondId/logs
 * Riwayat pemberian pakan kolam.
 */
exports.getFeedingLogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 30;

    const { data, error } = await supabase
      .from('feeding_logs')
      .select('*')
      .eq('pond_id', req.params.pondId)
      .order('actual_time', { ascending: false })
      .limit(limit);

    if (error) throw error;
    res.json(data);

  } catch (err) {
    next(err);
  }
};
