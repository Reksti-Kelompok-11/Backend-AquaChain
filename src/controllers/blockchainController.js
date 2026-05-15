const supabase = require('../services/supabaseService');

/**
 * GET /api/blockchain/logs/:pondId
 * Ambil riwayat blockchain anchoring untuk kolam tertentu.
 */
exports.getBlockchainLogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const { data, error } = await supabase
      .from('blockchain_logs')
      .select('*')
      .eq('pond_id', req.params.pondId)  // log_id = telemetry_id yang di-anchor
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    res.json(data);

  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/blockchain/verify/:txHash
 * Verifikasi bahwa tx hash ada dan statusnya verified.
 */
exports.verifyTransaction = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('blockchain_logs')
      .select('*')
      .eq('tx_hash', req.params.txHash)
      .single();

    if (error || !data) {
      return res.status(404).json({ verified: false, message: 'Transaction not found' });
    }

    res.json({
      verified:            data.verification_status === 'verified',
      tx_hash:             data.tx_hash,
      block_number:        data.block_number,
      timestamp:           data.timestamp,
      verification_status: data.verification_status,
    });

  } catch (err) {
    next(err);
  }
};
