# AquaChain Backend

Backend Express.js untuk sistem monitoring kolam ikan AquaChain, terhubung ke Supabase dan Polygon Mumbai Testnet.

---

## Stack

- **Express.js** — REST API
- **Supabase** — database PostgreSQL + realtime
- **Polygon Mumbai** — blockchain anchoring (testnet gratis)
- **ethers.js** — koneksi ke smart contract

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Konfigurasi environment
```bash
cp .env.example .env
```
Isi `.env` dengan nilai yang sebenarnya:
- `SUPABASE_URL` dan `SUPABASE_SERVICE_KEY` → dari Settings > API di dashboard Supabase
- `PRIVATE_KEY` → private key MetaMask kamu (jangan pernah share!)
- `CONTRACT_ADDRESS` → diisi setelah deploy smart contract

### 3. Deploy Smart Contract (lakukan sekali)
1. Buka https://remix.ethereum.org
2. Upload file `contracts/AquaChainLog.sol`
3. Compile dengan Solidity ^0.8.0
4. Sambungkan MetaMask ke **Polygon Mumbai Testnet**
5. Dapatkan MATIC gratis di https://mumbaifaucet.com
6. Deploy contract → copy address ke `CONTRACT_ADDRESS` di `.env`

### 4. Jalankan server
```bash
npm run dev     # development (auto-reload)
npm start       # production
```

---

## API Endpoints

### Kolam
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/ponds` | Daftar semua kolam |
| GET | `/api/ponds/:pondId` | Detail kolam |
| POST | `/api/ponds` | Tambah kolam baru |
| PATCH | `/api/ponds/:pondId/status` | Update status kolam |

### Telemetri (dipanggil ESP32)
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| POST | `/api/telemetry` | Kirim data sensor |
| GET | `/api/telemetry/:pondId` | Riwayat data sensor |

### Feeder
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/feeder/:pondId/schedules` | Jadwal pakan aktif |
| POST | `/api/feeder/schedules` | Buat jadwal baru |
| PATCH | `/api/feeder/schedules/:id/deactivate` | Nonaktifkan jadwal |
| POST | `/api/feeder/logs` | Catat hasil pemberian pakan |
| GET | `/api/feeder/:pondId/logs` | Riwayat pemberian pakan |

### Blockchain
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/blockchain/logs/:pondId` | Riwayat anchoring |
| GET | `/api/blockchain/verify/:txHash` | Verifikasi transaksi |

---

## Test dengan curl

```bash
# Health check
curl http://localhost:3000/health

# Simulasi ESP32 kirim data sensor
curl -X POST http://localhost:3000/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{"pond_id":"pond-001","ph":7.2,"temperature":28,"turbidity":30}'

# Ambil data kolam
curl http://localhost:3000/api/telemetry/pond-001
```

---

## Flow Data

```
ESP32 sensor
    │ POST /api/telemetry
    ▼
Express.js backend
    ├── Hitung FHI (Fish Health Index)
    ├── Simpan ke Supabase (tabel telemetry)
    └── Anchor hash ke Polygon Mumbai (async)
            └── Simpan tx_hash ke Supabase (tabel blockchain_logs)
```
