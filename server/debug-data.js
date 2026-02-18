const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const checkData = async () => {
    await connectDB();

    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const documents = await mongoose.connection.db.collection('documents').find({}).limit(3).toArray();
        console.log('\n--- Documents (3) ---');
        documents.forEach(doc => {
            console.log(JSON.stringify({
                id: doc._id,
                firmId: { type: typeof doc.firmId, val: doc.firmId, ctor: doc.firmId?.constructor?.name },
                clientId: { type: typeof doc.clientId, val: doc.clientId, ctor: doc.clientId?.constructor?.name }
            }));
        });

        const deadlines = await mongoose.connection.db.collection('deadlines').find({}).limit(3).toArray();
        console.log('\n--- Deadlines (3) ---');
        deadlines.forEach(doc => {
            console.log(JSON.stringify({
                id: doc._id,
                firmId: { type: typeof doc.firmId, val: doc.firmId, ctor: doc.firmId?.constructor?.name }
            }));
        });

        const users = await mongoose.connection.db.collection('users').find({ role: 'ca' }).limit(1).toArray();
        console.log('\n--- CA User ---');
        if (users.length > 0) {
            console.log(JSON.stringify({
                id: users[0]._id,
                firmId: { type: typeof users[0].firmId, val: users[0].firmId, ctor: users[0].firmId?.constructor?.name }
            }));
        } else {
            console.log('No CA user found');
        }

    } catch (err) {
        console.error('Error checking data:', err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

checkData();
