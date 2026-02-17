const express = require('express');
const router = express.Router();
const { registerFirm, login, refreshToken, inviteCA, inviteClient, acceptInvite } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { isFirmAdmin, isCA } = require('../middleware/roleCheck');

router.post('/firm/register', registerFirm);
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected Invite Routes
router.post('/invite/ca', authMiddleware, isFirmAdmin, inviteCA);
router.post('/invite/client', authMiddleware, isCA, inviteClient);

// Public Accept Invite
router.post('/accept-invite', acceptInvite);

module.exports = router;
