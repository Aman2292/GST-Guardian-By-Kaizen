const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const testAudit = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // 1. Setup Auth
        const userId = '6994a616a4f87d9c1756f50e'; // Riya CA
        const firmId = '6994a616a4f87d9c1756f50a';
        const secret = process.env.JWT_SECRET || 'supersecretjwtkey12345';
        const token = jwt.sign({ userId, firmId, role: 'ca', name: 'Riya CA' }, secret, { expiresIn: '1h' });

        // 2. Count logs before
        const beforeCount = await mongoose.connection.db.collection('auditlogs').countDocuments({ firmId: new mongoose.Types.ObjectId(firmId) });
        console.log(`Logs before: ${beforeCount}`);

        // 3. Perform Action: Add Dummy Client
        const dummyClient = {
            name: `Audit Test Client ${Date.now()}`,
            email: `audit.test.${Date.now()}@example.com`,
            password: 'password123',
            phone: '9876543210',
            businessName: `Audit Test Biz ${Date.now()}`,
            gstin: `22AAAAA0000A1Z${Math.floor(Math.random() * 9)}`
        };

        try {
            console.log('Adding dummy client...');
            const res = await axios.post('http://localhost:5000/api/ca/clients', dummyClient, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Client added:', res.status);
        } catch (err) {
            console.error('Failed to add client:', err.message);
            if (err.response) console.error(err.response.data);
        }

        // 4. Wait for async log
        console.log('Waiting for log...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 5. Count logs after
        const afterCount = await mongoose.connection.db.collection('auditlogs').countDocuments({ firmId: new mongoose.Types.ObjectId(firmId) });
        console.log(`Logs after: ${afterCount}`);

        if (afterCount > beforeCount) {
            const newLog = await mongoose.connection.db.collection('auditlogs').findOne({ firmId: new mongoose.Types.ObjectId(firmId) }, { sort: { createdAt: -1 } });
            console.log('New Log Entry:', JSON.stringify(newLog, null, 2));
            console.log('SUCCESS: Audit log created!');
        } else {
            console.log('FAILURE: No new log created.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

testAudit();
