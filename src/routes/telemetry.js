const express = require('express');
const router  = express.Router();
const { receiveTelemetry, getTelemetry } = require('../controllers/telemetryController');

router.post('/',         receiveTelemetry); // ESP32 kirim data sensor
router.get('/:pondId',   getTelemetry);     // dashboard ambil data

module.exports = router;
