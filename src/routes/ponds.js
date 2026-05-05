const express = require('express');
const router  = express.Router();
const {
  getAllPonds,
  getPondById,
  createPond,
  updatePondStatus,
} = require('../controllers/pondsController');

router.get('/',                       getAllPonds);
router.get('/:pondId',                getPondById);
router.post('/',                      createPond);
router.patch('/:pondId/status',       updatePondStatus);

module.exports = router;
