/**
 * dedup-deadlines.js
 * Removes duplicate deadline entries for each client (same dueDate + title).
 * Keeps the most recently created one.
 * Run: node dedup-deadlines.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Deadline = require('./models/Deadline');

dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected');

    // Find all deadlines, group by clientId + dueDate + title
    const all = await Deadline.find({}).sort({ createdAt: -1 }).lean();

    const seen = new Set();
    const toDelete = [];

    for (const d of all) {
        // Normalize dueDate to date-only string to catch same-day dupes
        const dateStr = new Date(d.dueDate).toISOString().split('T')[0];
        const key = `${d.clientId}_${dateStr}_${d.title}`;

        if (seen.has(key)) {
            toDelete.push(d._id);
        } else {
            seen.add(key);
        }
    }

    if (toDelete.length === 0) {
        console.log('No duplicates found.');
    } else {
        await Deadline.deleteMany({ _id: { $in: toDelete } });
        console.log(`Deleted ${toDelete.length} duplicate deadline(s).`);
    }

    // Show remaining
    const remaining = await Deadline.countDocuments({});
    console.log(`Remaining deadlines: ${remaining}`);

    process.exit();
};

run().catch(e => { console.error(e); process.exit(1); });
