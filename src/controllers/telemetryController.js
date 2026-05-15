const { v4: uuidv4 } = require('uuid');
const supabase = require('../services/supabaseService');
const { calculateFHI, getAlerts } = require('../services/fhiService');
const { anchorToBlockchain } = require('../services/blockchainService');

/**
 * POST /api/telemetry
 * Dipanggil oleh ESP32 setiap kali ada data sensor baru.
 */
exports.receiveTelemetry = async (req, res, next) => {
  try {
    const { pond_id, ph, temperature, turbidity } = req.body;

    // Validasi input
    if (!pond_id || ph == null || temperature == null || turbidity == null) {
      return res.status(400).json({ error: 'Missing required fields: pond_id, ph, temperature, turbidity' });
    }

    const telemetry_id = uuidv4();
    const fhi          = calculateFHI({ ph, temperature, turbidity });
    const alerts       = getAlerts({ ph, temperature, turbidity });

    // 1. Simpan ke Supabase
    const { error } = await supabase.from('telemetry').insert({
      telemetry_id,
      pond_id,
      ph,
      temperature,
      turbidity,
      timestamp: new Date().toISOString(),
    });
    if (error) throw error;    
    
    // try {
    //   await anchorToBlockchain({ telemetry_id, pond_id, ph, temperature, turbidity });
    // } catch (blockchainErr) {
    //   console.error('[Blockchain] Anchor failed:', blockchainErr.message);
    // }

    res.status(201).json({
      telemetry_id,
      fhi,
      alerts,
      message: alerts.length > 0 ? 'Data received — ada peringatan!' : 'Data received OK',
    });

  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/telemetry/:pondId
 * Ambil riwayat data sensor kolam, terbaru duluan.
 */
exports.getTelemetry = async (req, res, next) => {
  try {
    const { pondId } = req.params;
    const limit      = parseInt(req.query.limit) || 50;

    const { data, error } = await supabase
      .from('telemetry')
      .select('*')
      .eq('pond_id', pondId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    res.json(data);

  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/telemetry/
 * Ambil 5 riwayat data sensor kolam, terbaru duluan.
 */
exports.getTelemetryLastFive = async (req, res, next) => {
  try {
    const { pondId } = req.params;

    const { data, error } = await supabase
      .from('telemetry')
      .select('*')
      .eq('pond_id', pondId)
      .order('timestamp', { ascending: false })
      .limit(5);

    if (error) throw error;
    res.json(data);

  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/telemetry/fhi/:pondId
 * Ambil current FHI di pond.
 */
exports.getFHIPond = async (req, res, next) => {
  try {
    const { pondId } = req.params;
    const { data, error } = await supabase
      .from('telemetry')
      .select('ph, temperature, turbidity')
      .eq('pond_id', pondId)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (error) throw error;
    const fhi = calculateFHI(data[0]);
    res.json({ fhi });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/telemetry/alerts/:pondId
 * Ambil current alerts di pond.
 */
exports.getAlertsPond= async (req, res, next) => {
  try {
    const { pondId } = req.params;
    const { data, error } = await supabase
      .from('telemetry')
      .select('ph, temperature, turbidity')
      .eq('pond_id', pondId)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (error) throw error;
    const alerts = getAlerts(data[0]);
    res.json({ alerts });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/telemetry/fhi
 * Ambil 10 FHI terakhir di pond.
 */
exports.getFHIHistory = async (req, res, next) => {
  try {
    const { pondId } = req.params;
    
    const { data, error } = await supabase
      .from('telemetry')
      .select('ph, temperature, turbidity, timestamp')
      .eq('pond_id', pondId)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (error) throw error;

    const fhiData = data.map(d => {
      const score = calculateFHI({ ph: d.ph, temperature: d.temperature, turbidity: d.turbidity });
      let status = 'good';
      if (score < 50) status = 'danger';
      else if (score < 80) status = 'warning';

      return {
        date: d.timestamp,
        fhi: score,
        status
      };
    });

    res.json(fhiData);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/telemetry/alerts
 * Ambil 7 alert terakhir di pond.
 */
exports.getAlertsHistory = async (req, res, next) => {
  try {
    const { pondId } = req.params;

    const { data, error } = await supabase
      .from('telemetry')
      .select('ph, temperature, turbidity, timestamp')
      .eq('pond_id', pondId)
      .order('timestamp', { ascending: false })
      .limit(7);

    if (error) throw error;

    const alerts = data.flatMap((d, index) =>
      calculateAlerts({ ph: d.ph, temperature: d.temperature, turbidity: d.turbidity })
        .map(a => ({
          tanggal: d.timestamp,
          parameter: a.message,
          status: index === 0 ? "auto" : "resolved"
        }))
    );

    res.json(alerts);
  } catch (err) {
    next(err);
  }
};