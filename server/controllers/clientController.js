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
                    localField: '_id',
                    foreignField: 'deadlineId',
                    as: 'linkedDocuments'
                }
            },
            {
                $addFields: {
                    documentStatus: { $arrayElemAt: ['$linkedDocuments.status', 0] }
                }
            },
            { $project: { linkedDocuments: 0 } }
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
