const User = require('../models/User');
const Deadline = require('../models/Deadline');
const Document = require('../models/Document');
const bcrypt = require('bcryptjs');
const { generateDeadlinesForClient } = require('../services/deadlineService');

// @desc    Add a new Client
// @route   POST /api/ca/clients
exports.addClient = async (req, res) => {
    const { name, email, phone, businessName, gstin, businessType, address, pan } = req.body;

    try {
        // 1. Check if user exists
        let client = await User.findOne({ email });
        if (client) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        // 2. Create Client User
        // Default password for now (in real app, send invite)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('client123', salt);

        client = await User.create({
            firmId: req.user.firmId,
            name,
            email,
            password: hashedPassword,
            role: 'client',
            phone,
            clientProfile: {
                assignedCAId: req.user.userId,
                businessName,
                gstin,
                businessType,
                pan,
                address,
                onboardedAt: Date.now()
            }
        });

        // 3. Update CA's client count
        await User.findByIdAndUpdate(req.user.userId, { $inc: { 'caProfile.clientCount': 1 } });

        // 4. Generate Deadlines
        await generateDeadlinesForClient(client);

        res.status(201).json({ success: true, data: client, message: 'Client added and deadlines generated' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Get all clients for a CA
// @route   GET /api/ca/clients
exports.getClients = async (req, res) => {
    try {
        let query = { firmId: req.user.firmId, role: 'client' };

        // If not admin/firm owner, only show assumed clients
        if (!req.user.isAdmin && req.user.role !== 'firms') {
            query['clientProfile.assignedCAId'] = req.user.userId;
        }

        const clients = await User.find(query).select('-password');
        res.json({ success: true, count: clients.length, data: clients });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get Deadlines
// @route   GET /api/ca/deadlines
exports.getDeadlines = async (req, res) => {
    try {
        let query = { firmId: req.user.firmId };

        // If not admin, only show own clients' deadlines
        if (!req.user.isAdmin && req.user.role !== 'firms') {
            query.caId = req.user.userId;
        }

        if (req.query.clientId) {
            query.clientId = req.query.clientId;
        }

        const deadlines = await Deadline.find(query)
            .populate('clientId', 'name clientProfile.businessName')
            .sort({ dueDate: 1 }); // Ascending order

        res.json({ success: true, count: deadlines.length, data: deadlines });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Mark Deadline as Filed
// @route   PATCH /api/ca/deadlines/:id/file
exports.markAsFiled = async (req, res) => {
    try {
        const deadline = await Deadline.findById(req.params.id);

        if (!deadline) {
            return res.status(404).json({ success: false, message: 'Deadline not found' });
        }

        // Verify ownership/firm
        if (deadline.firmId.toString() !== req.user.firmId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        deadline.status = 'filed';
        deadline.filedAt = Date.now();
        deadline.filedBy = req.user.userId;

        await deadline.save();

        res.json({ success: true, data: deadline });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
// @desc    Get Client by ID
// @route   GET /api/ca/clients/:id
exports.getClient = async (req, res) => {
    try {
        const client = await User.findById(req.params.id).select('-password');

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        // Verify access (must be in same firm)
        if (client.firmId.toString() !== req.user.firmId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.json({ success: true, data: client });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update Client Details
// @route   PUT /api/ca/clients/:id
exports.updateClient = async (req, res) => {
    try {
        const { name, phone, businessName, gstin, address, pan } = req.body;

        let client = await User.findById(req.params.id);

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        if (client.firmId.toString() !== req.user.firmId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Update fields
        client.name = name || client.name;
        client.phone = phone || client.phone;
        if (client.clientProfile) {
            client.clientProfile.businessName = businessName || client.clientProfile.businessName;
            client.clientProfile.gstin = gstin || client.clientProfile.gstin;
            client.clientProfile.address = address || client.clientProfile.address;
            client.clientProfile.pan = pan || client.clientProfile.pan;
        }

        await client.save();
        res.json({ success: true, data: client, message: 'Client updated successfully' });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
// @desc    Get CA Dashboard Stats
// @route   GET /api/ca/stats
exports.getDashboardStats = async (req, res) => {
    try {
        const firmId = req.user.firmId;
        const caId = req.user.userId;

        // Clients count
        let clientQuery = { firmId, role: 'client' };
        if (!req.user.isAdmin && req.user.role !== 'firms') {
            clientQuery['clientProfile.assignedCAId'] = caId;
        }
        const clientCount = await User.countDocuments(clientQuery);

        // Deadlines count (Pending)
        let deadlineQuery = { firmId, status: { $ne: 'filed' } };
        if (!req.user.isAdmin && req.user.role !== 'firms') {
            deadlineQuery.caId = caId;
        }
        const pendingDeadlines = await Deadline.countDocuments(deadlineQuery);

        // Documents Pending Final Verification (verified_l1)
        let docQuery = { firmId, status: 'verified_l1' };
        // We filter docs similarly? Document model has clientId but not necessarily caId unless we add it.
        // For now, firm wide for CA/Admin
        const pendingVerification = await Document.countDocuments(docQuery);

        // Documents AI Audited (processed)
        const aiAudited = await Document.countDocuments({ firmId, status: 'processed' });

        res.json({
            success: true,
            data: {
                clientCount,
                pendingDeadlines,
                pendingVerification,
                aiAudited
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
