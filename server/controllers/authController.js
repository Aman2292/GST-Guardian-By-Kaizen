const Firm = require('../models/Firm');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateTokens, verifyToken } = require('../utils/jwtHelper');
const crypto = require('crypto');

// @desc    Register a new Firm and Admin User
// @route   POST /api/auth/firm/register
exports.registerFirm = async (req, res) => {
    const { firmName, email, password, phone, address, gstNumber, logo } = req.body;

    try {
        // Check if firm exists
        const firmExists = await Firm.findOne({ email });
        if (firmExists) {
            return res.status(400).json({ success: false, message: 'Firm already registered with this email' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create Firm
        const firm = await Firm.create({
            firmName,
            email,
            password: hashedPassword,
            phone,
            address,
            gstNumber,
            logo
        });

        // Create Admin User
        const user = await User.create({
            firmId: firm._id,
            name: `Admin - ${firmName}`,
            email,
            password: hashedPassword,
            role: 'firms',
            phone,
            caProfile: {
                isAdmin: true,
                clientCount: 0
            }
        });

        // Generate Tokens
        const { accessToken, refreshToken } = generateTokens(user);

        res.status(201).json({
            success: true,
            data: {
                firmId: firm._id,
                userId: user._id,
                role: user.role,
                isAdmin: true,
                accessToken,
                refreshToken
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Login User
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid Credentials' });
        }

        const { accessToken, refreshToken } = generateTokens(user);

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        res.json({
            success: true,
            data: {
                firmId: user.firmId,
                userId: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isAdmin: user.caProfile?.isAdmin || false,
                clientProfile: user.clientProfile,
                phone: user.phone,
                accessToken,
                refreshToken
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Refresh Token
// @route   POST /api/auth/refresh
exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'No token' });

    const decoded = verifyToken(refreshToken, true);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

    try {
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const tokens = generateTokens(user);
        res.json({ success: true, data: tokens });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Invite a new CA to the Firm
// @route   POST /api/auth/invite/ca
exports.inviteCA = async (req, res) => {
    // Only Firm Admin can invite CAs
    if (req.user.role !== 'firms') {
        return res.status(403).json({ success: false, message: 'Only Firm Admin can invite CAs' });
    }

    const { email } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const inviteToken = crypto.randomBytes(20).toString('hex');
        // In production: store token in DB with expiration

        // Simulating email sending
        const inviteLink = `${process.env.VITE_API_BASE_URL}/register/ca?token=${inviteToken}&firmId=${req.user.firmId}&email=${email}`;

        res.json({ success: true, message: 'Invite generated (Simulator)', link: inviteLink });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Invite a new Client
// @route   POST /api/auth/invite/client
exports.inviteClient = async (req, res) => {
    if (req.user.role !== 'ca') {
        return res.status(403).json({ success: false, message: 'Only CAs can invite clients' });
    }

    const { email } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const inviteToken = crypto.randomBytes(20).toString('hex');

        // Simulating email sending
        const inviteLink = `${process.env.VITE_API_BASE_URL}/register/client?token=${inviteToken}&firmId=${req.user.firmId}&caId=${req.user.userId}&email=${email}`;

        res.json({ success: true, message: 'Invite generated (Simulator)', link: inviteLink });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Accept Invite & Register
// @route   POST /api/auth/accept-invite
exports.acceptInvite = async (req, res) => {
    const { email, password, firmId, caId, role, name, phone, businessName } = req.body;
    // token validation would happen here against DB

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userPayload = {
            firmId,
            name,
            email,
            password: hashedPassword,
            role, // 'ca' or 'client'
            phone,
            isActive: true
        };

        if (role === 'ca') {
            userPayload.caProfile = { isAdmin: false, clientCount: 0 };
        } else if (role === 'client') {
            userPayload.clientProfile = {
                assignedCAId: caId,
                businessName: businessName,
                onboardedAt: Date.now()
            };
        }

        const user = await User.create(userPayload);
        const tokens = generateTokens(user);

        res.status(201).json({ success: true, data: { user, ...tokens } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
