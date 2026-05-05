const express = require('express');
const router  = express.Router();
const { getBlockchainLogs, verifyTransaction } = require('../controllers/blockchainController');

router.get('/logs/:pondId',       getBlockchainLogs);
router.get('/verify/:txHash',     verifyTransaction);

module.exports = router;
