const express = require('express');
const router = express.Router();
const { protect, roleCheck } = require('../middleware/authMiddleware');
const { getFirmStats, getCAs } = require('../controllers/firmController');

// All routes are protected and require 'firms' role
router.use(protect);
router.use(roleCheck(['firms']));

router.get('/stats', getFirmStats);
router.get('/cas', getCAs);

module.exports = router;
