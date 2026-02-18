/**
 * seed-urgent-deadline.js
 * Adds an urgent deadline (within 2 days) for Rahul to trigger the Dynamic Island.
 * Run: node seed-urgent-deadline.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Deadline = require('./models/Deadline');

dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected');

    const client = await User.findOne({ email: 'rahul@client.com' });
    if (!client) { console.log('Client not found'); process.exit(1); }

    // Today is Feb 18, 2026 — add deadline for Feb 20 (2 days) and Feb 22 (4 days)
    const today = new Date('2026-02-18');

    const urgentDeadlines = [
        {
            firmId: client.firmId,
            clientId: client._id,
            title: 'GSTR-3B Filing (Feb)',
            description: 'Monthly GST return filing for February 2026',
            dueDate: new Date('2026-02-20'),
            type: 'GST',
            status: 'pending',
            priority: 'high'
        },
        {
            firmId: client.firmId,
            clientId: client._id,
            title: 'TDS Payment Deadline',
            description: 'Monthly TDS payment for January deductions',
            dueDate: new Date('2026-02-22'),
            type: 'TDS',
            status: 'pending',
            priority: 'high'
        }
    ];

    for (const d of urgentDeadlines) {
        const exists = await Deadline.findOne({ clientId: client._id, title: d.title });
        if (!exists) {
            await Deadline.create(d);
            console.log(`Created: ${d.title} (due ${d.dueDate.toDateString()})`);
        } else {
            // Update due date to ensure it's within 5 days
            await Deadline.updateOne({ _id: exists._id }, { dueDate: d.dueDate, status: 'pending' });
            console.log(`Updated: ${d.title}`);
        }
    }

    console.log('Done');
    process.exit();
};

run().catch(e => { console.error(e); process.exit(1); });
