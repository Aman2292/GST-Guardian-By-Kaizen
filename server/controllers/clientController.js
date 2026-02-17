const Deadline = require('../models/Deadline');

// @desc    Get deadlines for logged in client
// @route   GET /api/client/my-deadlines
exports.getMyDeadlines = async (req, res) => {
    try {
        const clientUserId = new (require('mongoose').Types.ObjectId)(req.user.userId);

        const deadlines = await Deadline.aggregate([
            { $match: { clientId: clientUserId } },
            { $sort: { dueDate: 1 } },
            {
                $lookup: {
                    from: 'documents',
                    let: { deadlineId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$deadlineId', '$$deadlineId'] } } },
                        { $sort: { updatedAt: -1 } }
                    ],
                    as: 'linkedDocuments'
                }
            },
            {
                $addFields: {
                    documentStatus: { $arrayElemAt: ['$linkedDocuments.status', 0] },
                    verifiedBy: { $arrayElemAt: ['$linkedDocuments.verifiedBy', 0] },
                    verifiedBy_l2: { $arrayElemAt: ['$linkedDocuments.verifiedBy_l2', 0] }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'verifiedBy',
                    foreignField: '_id',
                    as: 'verifier'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'verifiedBy_l2',
                    foreignField: '_id',
                    as: 'verifier_l2'
                }
            },
            {
                $addFields: {
                    verifiedByName: { $arrayElemAt: ['$verifier.name', 0] },
                    verifiedByL2Name: { $arrayElemAt: ['$verifier_l2.name', 0] }
                }
            },
            { $project: { linkedDocuments: 0, verifier: 0, verifier_l2: 0 } }
        ]);

        res.json({
            success: true,
            count: deadlines.length,
            data: deadlines
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
