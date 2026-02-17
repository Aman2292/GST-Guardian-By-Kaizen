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
