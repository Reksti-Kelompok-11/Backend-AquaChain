const express = require('express');
const router  = express.Router();
const {
  getSchedules,
  createSchedule,
  deactivateSchedule,
  createFeedingLog,
  getFeedingLogs,
  getAllSchedules
} = require('../controllers/feederController');

router.get('/:pondId/schedules',               getSchedules);
router.get('/schedules',               getAllSchedules);
router.post('/schedules',                      createSchedule);
router.patch('/schedules/:scheduleId/deactivate', deactivateSchedule);

router.post('/logs',           createFeedingLog);
router.get('/:pondId/logs',    getFeedingLogs);

module.exports = router;
