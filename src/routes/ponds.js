const express = require('express');
const router  = express.Router();
const {
  getAllPonds,
  getPondById,
  updatePondStatus,
} = require('../controllers/pondsController');

router.get('/',                       getAllPonds);
router.get('/:pondId',                getPondById);
router.patch('/:pondId/status',       updatePondStatus);

module.exports = router;
