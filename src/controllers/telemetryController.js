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

    // 2. Anchor ke blockchain (async — tidak blok response ke ESP32)
    //    Jika gagal, error dicatat di log tapi tidak gagalkan request
    // anchorToBlockchain({ telemetry_id, pond_id, ph, temperature, turbidity })
    //   .catch(err => console.error('[Blockchain] Anchor failed:', err.message));

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

// POST /api/telemetry/webhook
// Dipanggil otomatis oleh Supabase setiap ada INSERT di tabel telemetry
exports.processWebhook = async (req, res, next) => {
  try {
    // Supabase membungkus data baru di dalam properti "record"
    const newData = req.body.record;
    
    if (!newData) {
      return res.status(400).json({ error: 'Format Webhook tidak valid' });
    }

    const { telemetry_id, pond_id, ph, temperature, turbidity } = newData;

    // 1. Hitung FHI & Peringatan
    // (Bisa dikembangkan nanti untuk memicu notifikasi Push ke Mobile App)
    const fhi = calculateFHI({ ph, temperature, turbidity });
    const alerts = getAlerts({ ph, temperature, turbidity });

    console.log(`[WEBHOOK] Data baru dari ${pond_id}. FHI: ${fhi} | Alerts: ${alerts.length}`);

    // 2. Anchor ke Blockchain Polygon Mumbai (Asinkron)
    // Hapus tanda komentar (//) di bawah ini jika smart contract sudah di-deploy
    /*
    anchorToBlockchain({ telemetry_id, pond_id, ph, temperature, turbidity })
      .then(receipt => console.log(`[Blockchain] Success Tx: ${receipt.hash}`))
      .catch(err => console.error('[Blockchain] Anchor failed:', err.message));
    */

    res.status(200).json({ message: 'Webhook berhasil diproses' });
  } catch (err) {
    next(err);
  }
};