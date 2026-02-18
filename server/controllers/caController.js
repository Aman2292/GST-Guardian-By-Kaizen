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

        // Documents Pending CA Verification (processed)
        let docQuery = { firmId, status: 'processed' };
        const pendingVerification = await Document.countDocuments(docQuery);

        // Documents already Verified (verified_l1)
        const verifiedCount = await Document.countDocuments({ firmId, status: 'verified_l1' });

        res.json({
            success: true,
            data: {
                clientCount,
                pendingDeadlines,
                pendingVerification,
                verifiedCount,
                aiAudited: pendingVerification
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get documents grouped by client
// @route   GET /api/ca/documents/grouped
exports.getGroupedDocuments = async (req, res) => {
    try {
        const { month, year, clientId } = req.query;
        const mongoose = require('mongoose');

        // Build base query
        let matchQuery = { firmId: new mongoose.Types.ObjectId(req.user.firmId) };

        // Filter by specific client if provided
        if (clientId) {
            matchQuery.clientId = new mongoose.Types.ObjectId(clientId);
        }

        // Filter by month/year if provided
        if (month && year) {
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
            matchQuery.createdAt = { $gte: startDate, $lte: endDate };
        }

        console.log('[CA Documents Grouped] User:', JSON.stringify(req.user));
        console.log('[CA Documents Grouped] Query:', JSON.stringify(matchQuery));

        // Debug: Check raw count
        const totalDocs = await Document.countDocuments({ firmId: req.user.firmId });
        console.log('[CA Documents Grouped] Total docs for firm (raw find):', totalDocs);

        // Aggregate documents by client
        const grouped = await Document.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$clientId',
                    documentCount: { $sum: 1 },
                    documents: { $push: '$$ROOT' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'clientInfo'
                }
            },
            {
                $unwind: {
                    path: '$clientInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    client: {
                        _id: '$clientInfo._id',
                        name: '$clientInfo.name',
                        businessName: '$clientInfo.clientProfile.businessName',
                        gstin: '$clientInfo.clientProfile.gstin'
                    },
                    documentCount: 1,
                    documents: 1
                }
            },
            { $sort: { documentCount: -1 } }
        ]);

        console.log('[CA Documents Grouped] Found', grouped.length, 'groups');
        res.json({ success: true, count: grouped.length, data: grouped });
    } catch (err) {
        console.error('[CA Documents Grouped] Error:', err);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// @desc    Get deadlines grouped by client
// @route   GET /api/ca/deadlines/grouped
exports.getGroupedDeadlines = async (req, res) => {
    try {
        const { month, year, status, sortBy } = req.query;
        const mongoose = require('mongoose');

        // Build base query
        let matchQuery = { firmId: new mongoose.Types.ObjectId(req.user.firmId) };

        // Filter by month/year if provided
        if (month && year) {
            matchQuery.month = parseInt(month);
            matchQuery.year = parseInt(year);
        }

        // Filter by status
        const now = new Date();
        if (status === 'overdue') {
            matchQuery.dueDate = { $lt: now };
            matchQuery.status = { $ne: 'filed' };
        } else if (status === 'pending') {
            matchQuery.status = { $ne: 'filed' };
        } else if (status === 'filed') {
            matchQuery.status = 'filed';
        }

        console.log('[CA Deadlines Grouped] Query:', JSON.stringify(matchQuery));

        // Debug: Check raw count
        const totalDeadlines = await Deadline.countDocuments({ firmId: req.user.firmId });
        console.log('[CA Deadlines Grouped] Total deadlines for firm (raw find):', totalDeadlines);

        // Aggregate deadlines by client
        const grouped = await Deadline.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$clientId',
                    totalDeadlines: { $sum: 1 },
                    pendingCount: {
                        $sum: { $cond: [{ $ne: ['$status', 'filed'] }, 1, 0] }
                    },
                    overdueCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $lt: ['$dueDate', now] },
                                        { $ne: ['$status', 'filed'] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    urgentCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ['$dueDate', now] },
                                        { $lte: ['$dueDate', new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)] },
                                        { $ne: ['$status', 'filed'] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    deadlines: { $push: '$$ROOT' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'clientInfo'
                }
            },
            {
                $unwind: {
                    path: '$clientInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    client: {
                        _id: '$clientInfo._id',
                        name: '$clientInfo.name',
                        businessName: '$clientInfo.clientProfile.businessName',
                        gstin: '$clientInfo.clientProfile.gstin'
                    },
                    totalDeadlines: 1,
                    pendingCount: 1,
                    overdueCount: 1,
                    urgentCount: 1,
                    deadlines: 1
                }
            },
            { $sort: { [sortBy || 'pendingCount']: -1 } }
        ]);

        console.log('[CA Deadlines Grouped] Found', grouped.length, 'groups');
        res.json({ success: true, count: grouped.length, data: grouped });
    } catch (err) {
        console.error('[CA Deadlines Grouped] Error:', err);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};
