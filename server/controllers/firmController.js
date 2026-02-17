const User = require('../models/User');
const Deadline = require('../models/Deadline');
const Document = require('../models/Document');
const Firm = require('../models/Firm');

// @desc    Get Firm Stats (Clients, CAs, Deadlines)
// @route   GET /api/firm/stats
exports.getFirmStats = async (req, res) => {
    try {
        const firmId = req.user.firmId;

        // Count CAs (role: 'ca')
        const caCount = await User.countDocuments({ firmId, role: 'ca' });

        // Count Clients (role: 'client')
        const clientCount = await User.countDocuments({ firmId, role: 'client' });

        // Count Pending Deadlines (status: 'Pending') across all clients of this firm
        // We first need to find all clients of this firm
        const clients = await User.find({ firmId, role: 'client' }).select('_id');
        const clientIds = clients.map(c => c._id);

        const pendingDeadlines = await Deadline.countDocuments({
            clientId: { $in: clientIds },
            status: 'Pending'
        });

        res.json({
            success: true,
            data: {
                caCount,
                clientCount,
                pendingDeadlines
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update Firm Settings (Deadlines)
// @route   PUT /api/firm/settings
exports.updateSettings = async (req, res) => {
    try {
        const { complianceConfig } = req.body;

        const firm = await Firm.findByIdAndUpdate(
            req.user.firmId,
            { complianceConfig },
            { new: true }
        );

        res.json({ success: true, data: firm });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Seed Deadlines for All Clients
// @route   POST /api/firm/seed-deadlines
exports.seedDeadlines = async (req, res) => {
    try {
        const users = await User.find({ firmId: req.user.firmId, role: 'client' });
        const { generateDeadlinesForClient } = require('../services/deadlineService');

        for (const client of users) {
            await generateDeadlinesForClient(client);
        }

        res.json({ success: true, message: `Seeded deadlines for ${users.length} clients` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all CAs in the firm
// @route   GET /api/firm/cas
exports.getCAs = async (req, res) => {
    try {
        const firmId = req.user.firmId;

        const cas = await User.find({ firmId, role: 'ca' })
            .select('name email phone caProfile lastLogin isActive')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: cas
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all Clients in the firm
// @route   GET /api/firm/clients
exports.getFirmClients = async (req, res) => {
    try {
        const firmId = req.user.firmId;
        const clients = await User.find({ firmId, role: 'client' })
            .select('name email phone clientProfile createdAt')
            .populate('clientProfile.assignedCAId', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: clients });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Assign CA to Client
// @route   PUT /api/firm/clients/:clientId/assign-ca
exports.assignCAToClient = async (req, res) => {
    try {
        const { caId } = req.body;
        const { clientId } = req.params;

        // Verify CA belongs to firm
        const ca = await User.findOne({ _id: caId, firmId: req.user.firmId, role: 'ca' });
        if (!ca) {
            return res.status(404).json({ success: false, message: 'CA not found or not in firm' });
        }

        const client = await User.findOneAndUpdate(
            { _id: clientId, firmId: req.user.firmId },
            { 'clientProfile.assignedCAId': caId },
            { new: true }
        ).populate('clientProfile.assignedCAId', 'name');

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        // Increment CA client count (optional, good for stats)
        await User.findByIdAndUpdate(caId, { $inc: { 'caProfile.clientCount': 1 } });

        res.json({ success: true, data: client, message: 'CA Assigned Successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get All Deadlines for Firm
// @route   GET /api/firm/deadlines
exports.getFirmDeadlines = async (req, res) => {
    try {
        const firmId = req.user.firmId;
        const deadlines = await Deadline.find({ firmId })
            .populate('clientId', 'name clientProfile.businessName')
            .populate('caId', 'name') // populated if assigned
            .sort({ dueDate: 1 });

        res.json({ success: true, data: deadlines });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
