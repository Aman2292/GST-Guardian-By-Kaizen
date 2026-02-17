const express = require('express');
const router = express.Router();
const { addClient, getClients, getDeadlines, markAsFiled } = require('../controllers/caController');
const authMiddleware = require('../middleware/authMiddleware');
const { isCA } = require('../middleware/roleCheck');

// All routes here require CA role
router.use(authMiddleware, isCA);

router.post('/clients', addClient);
router.get('/clients', getClients);
router.get('/deadlines', getDeadlines);
router.patch('/deadlines/:id/file', markAsFiled);

module.exports = router;
