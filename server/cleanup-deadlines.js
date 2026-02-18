const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Deadline = require('./models/Deadline');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    // Delete deadlines that have no 'month' field (created by seed-urgent-deadline.js)
    const result = await Deadline.deleteMany({ month: { $exists: false } });
    console.log('Deleted orphan deadlines (no month field):', result.deletedCount);

    // Show remaining
    const all = await Deadline.find({}, 'type dueDate status month').lean();
    all.forEach(d => console.log(
        d.type.padEnd(20),
        new Date(d.dueDate).toDateString().padEnd(20),
        'month:', String(d.month).padEnd(4),
        'status:', d.status
    ));
    console.log('Total:', all.length);
    process.exit();
});
