const express = require('express');
const router = express.Router();
const { getMyDeadlines } = require('../controllers/clientController');
const authMiddleware = require('../middleware/authMiddleware');
const { isClient } = require('../middleware/roleCheck');

// All routes require client role
router.use(authMiddleware, isClient);

router.get('/my-deadlines', getMyDeadlines);

module.exports = router;
