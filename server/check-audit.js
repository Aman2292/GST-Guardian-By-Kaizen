const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkAudit = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Find a CA (same one as before) to get a valid firmId
        const ca = await mongoose.connection.db.collection('users').findOne({ role: 'ca' });
        if (!ca) {
            console.log('No CA found!');
            return;
        }

        const firmId = ca.firmId; // This is an ObjectId
        console.log(`Checking audit logs for firmId: ${firmId} (Type: ${typeof firmId})`);

        const count = await mongoose.connection.db.collection('auditlogs').countDocuments({ firmId: firmId });
        console.log(`Total Audit Logs for this firm: ${count}`);

        const sample = await mongoose.connection.db.collection('auditlogs').findOne({ firmId: firmId });
        if (sample) {
            console.log('Sample Log:', JSON.stringify(sample, null, 2));
        } else {
            console.log('No logs found.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

checkAudit();
