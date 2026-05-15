const express = require('express');
const router  = express.Router();
const { receiveTelemetry, getTelemetry, getAlertsPond, getFHIPond, getFHIHistory, getAlertsHistory } = require('../controllers/telemetryController');

router.post('/',         receiveTelemetry);
router.get('/:pondId',   getTelemetry); 
router.get('/fhi/:pondId',   getFHIPond);
router.get('/alerts/:pondId',   getAlertsPond);
router.get('/fhiHistory/:pondId',   getFHIHistory);
router.get('/alertsHistory/:pondId',   getAlertsHistory);

module.exports = router;
