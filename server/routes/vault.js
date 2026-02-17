const express = require('express');
const router = express.Router();
const { getGapAnalysis, getVaultStats } = require('../controllers/vaultController');
const authMiddleware = require('../middleware/authMiddleware');

// All vault routes require authentication
router.use(authMiddleware);

// @route   GET /api/vault/gap-analysis/:clientId
router.get('/gap-analysis/:clientId', getGapAnalysis);

// @route   GET /api/vault/stats/:clientId
router.get('/stats/:clientId', getVaultStats);

module.exports = router;
