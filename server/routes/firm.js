const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { isFirmAdmin } = require('../middleware/roleCheck');
const { getFirmStats, getCAs, updateSettings, seedDeadlines, getFirmClients, assignCAToClient, getFirmDeadlines } = require('../controllers/firmController');

// All routes are protected and require 'firms' role
router.use(authMiddleware);
router.use(isFirmAdmin);

router.get('/stats', getFirmStats);
router.get('/cas', getCAs);
router.get('/clients', getFirmClients);
router.get('/deadlines', getFirmDeadlines);
router.put('/settings', updateSettings);
router.post('/seed-deadlines', seedDeadlines);
router.put('/clients/:clientId/assign-ca', assignCAToClient);

module.exports = router;
