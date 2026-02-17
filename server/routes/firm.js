const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { isFirmAdmin } = require('../middleware/roleCheck');
const { getFirmStats, getCAs } = require('../controllers/firmController');

// All routes are protected and require 'firms' role
router.use(authMiddleware);
router.use(isFirmAdmin);

router.get('/stats', getFirmStats);
router.get('/cas', getCAs);

module.exports = router;
