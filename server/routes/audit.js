const express = require('express');
const router = express.Router();
const {
    getFirmAuditLogs,
    getClientActivityLog,
    getCAActivityLog,
    getAuditStats
} = require('../controllers/auditController');
const authMiddleware = require('../middleware/authMiddleware');
const { isFirmAdmin } = require('../middleware/roleCheck');

// All audit routes require authentication
router.use(authMiddleware);

// @route   GET /api/audit/firm
// @desc    Get all audit logs for the firm (with filters)
// @access  Firm Admin only
router.get('/firm', isFirmAdmin, getFirmAuditLogs);

// @route   GET /api/audit/stats
// @desc    Get audit statistics
// @access  Firm Admin only
router.get('/stats', isFirmAdmin, getAuditStats);

// @route   GET /api/audit/client/:clientId
// @desc    Get activity log for a specific client
// @access  Firm Admin & Assigned CA
router.get('/client/:clientId', getClientActivityLog);

// @route   GET /api/audit/ca/:caId
// @desc    Get activity log for a specific CA
// @access  Firm Admin only
router.get('/ca/:caId', isFirmAdmin, getCAActivityLog);

module.exports = router;
