const express = require('express');
const router  = express.Router();
const { receiveTelemetry, getTelemetry, getTelemetryLastFive, getAlertsPond, getFHIPond, getFHIHistory } = require('../controllers/telemetryController');

router.post('/',         receiveTelemetry); // ESP32 kirim data sensor
router.get('/',      getTelemetryLastFive); // dashboard ambil 5 data
router.get('/:pondId',   getTelemetry);     // dashboard ambil data
router.get('/fhi/:pondId',   getFHIPond);
router.get('/alerts/:pondId',   getAlertsPond);
router.get('/fhi',   getFHIHistory);

module.exports = router;
