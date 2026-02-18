const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

// @desc    Get all audit logs for a firm with filters
// @route   GET /api/audit/firm
// @access  Firm Admin only
exports.getFirmAuditLogs = async (req, res) => {
    try {
        const { startDate, endDate, userId, action, resource, limit = 100 } = req.query;

        const query = { firmId: new mongoose.Types.ObjectId(req.user.firmId) };

        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // User filter
        if (userId) {
            query.performedBy = new mongoose.Types.ObjectId(userId);
        }

        // Action filter
        if (action) {
            query.action = action;
        }

        // Resource filter
        if (resource) {
            query.resource = resource;
        }

        const logs = await AuditLog.find(query)
            .populate('performedBy', 'name email role')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        const total = await AuditLog.countDocuments(query);

        res.json({
            success: true,
            data: {
                logs,
                total,
                page: 1,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching firm audit logs:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get audit logs for a specific client
// @route   GET /api/audit/client/:clientId
// @access  Firm Admin & Assigned CA
exports.getClientActivityLog = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { limit = 50 } = req.query;

        const query = {
            firmId: req.user.firmId,
            $or: [
                { resourceId: new mongoose.Types.ObjectId(clientId) },
                { 'details.clientId': clientId }
            ]
        };

        const logs = await AuditLog.find(query)
            .populate('performedBy', 'name email role')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error('Error fetching client activity log:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get audit logs for a specific CA
// @route   GET /api/audit/ca/:caId
// @access  Firm Admin only
exports.getCAActivityLog = async (req, res) => {
    try {
        const { caId } = req.params;
        const { limit = 50 } = req.query;

        const logs = await AuditLog.find({
            firmId: req.user.firmId,
            performedBy: new mongoose.Types.ObjectId(caId)
        })
            .populate('performedBy', 'name email role')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error('Error fetching CA activity log:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get audit log statistics
// @route   GET /api/audit/stats
// @access  Firm Admin only
exports.getAuditStats = async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const stats = await AuditLog.aggregate([
            {
                $match: {
                    firmId: new mongoose.Types.ObjectId(req.user.firmId),
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 }
                }
            }
        ]);

        const byUser = await AuditLog.aggregate([
            {
                $match: {
                    firmId: new mongoose.Types.ObjectId(req.user.firmId),
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$performedBy',
                    count: { $sum: 1 },
                    name: { $first: '$performedByName' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                byAction: stats,
                byUser,
                period: `Last ${days} days`
            }
        });
    } catch (error) {
        console.error('Error fetching audit stats:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
