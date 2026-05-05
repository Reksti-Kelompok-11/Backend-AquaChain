const { ethers } = require('ethers');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const supabase = require('./supabaseService');

// ABI hanya fungsi yang kita pakai dari smart contract
const ABI = [
  'function anchorData(string memory telemetry_id, string memory pond_id, bytes32 dataHash) public',
  'event DataAnchored(string telemetry_id, string pond_id, bytes32 dataHash, uint256 timestamp)',
];

function getContract() {
  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
  const wallet   = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  return new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, wallet);
}

/**
 * Anchor data telemetri ke Polygon Mumbai.
 * Flow: hash data → kirim tx → simpan bukti ke Supabase
 */
async function anchorToBlockchain({ telemetry_id, pond_id, ph, temperature, turbidity }) {
  // 1. Buat SHA-256 hash dari data sensor
  const raw      = JSON.stringify({ telemetry_id, pond_id, ph, temperature, turbidity });
  const dataHash = '0x' + crypto.createHash('sha256').update(raw).digest('hex');

  // 2. Kirim transaksi ke smart contract
  const contract = getContract();
  const tx       = await contract.anchorData(telemetry_id, pond_id, dataHash);
  const receipt  = await tx.wait(); // tunggu konfirmasi block

  // 3. Simpan bukti transaksi ke tabel blockchain_logs
  const { error } = await supabase.from('blockchain_logs').insert({
    blockchain_id:       uuidv4(),
    log_id:              telemetry_id,
    tx_hash:             receipt.hash,
    block_number:        receipt.blockNumber,
    timestamp:           new Date().toISOString(),
    verification_status: 'verified',
  });

  if (error) throw error;

  console.log(`⛓️  Anchored ${telemetry_id} → tx: ${receipt.hash}`);
  return receipt;
}

module.exports = { anchorToBlockchain };
