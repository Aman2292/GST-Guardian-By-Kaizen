const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Firm = require('./models/Firm');
const User = require('./models/User');
const Deadline = require('./models/Deadline');
const { generateDeadlinesForClient } = require('./services/deadlineService');

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await Firm.deleteMany({});
        await User.deleteMany({});
        await Deadline.deleteMany({});
        console.log('Cleared existing Firms, Users, and Deadlines');

        // 1. Create Firm
        const salt = await bcrypt.genSalt(10);
        const firmPassword = await bcrypt.hash('firm123', salt);

        const firm = await Firm.create({
            firmName: 'Demo Associates',
            email: 'admin@demo.com',
            password: firmPassword,
            phone: '9876543210',
            address: '123, CA Street, Fintech City',
            gstNumber: '22AAAAA0000A1Z5',
            plan: 'pro'
        });
        console.log('Firm created: Demo Associates');

        // 2. Create Firm Admin (Role: firms)
        const caPassword = firmPassword; // Same for simplicity
        const caUser = await User.create({
            firmId: firm._id,
            name: 'Aman Firm Admin',
            email: 'aman@demo.com',
            password: caPassword,
            role: 'firms',
            phone: '9876543210',
            caProfile: {
                isAdmin: true,
                clientCount: 1,
                membershipNumber: 'MEM123456'
            }
        });
        console.log('Firm Admin created: Aman Firm Admin (aman@demo.com)');

        // 2.5 Create CA Employee (Non-Admin)
        const employeeUser = await User.create({
            firmId: firm._id,
            name: 'Riya CA',
            email: 'riya@demo.com',
            password: caPassword,
            role: 'ca',
            phone: '9876543210',
            caProfile: {
                isAdmin: false, // Standard CA
                clientCount: 0,
                membershipNumber: 'MEM987654'
            }
        });
        console.log('CA Employee created: Riya CA (riya@demo.com)');

        // 3. Create Client
        const clientPassword = await bcrypt.hash('client123', salt);
        const clientUser = await User.create({
            firmId: firm._id,
            name: 'Rahul Client',
            email: 'rahul@client.com',
            password: clientPassword,
            role: 'client',
            phone: '9988776655',
            clientProfile: {
                assignedCAId: caUser._id,
                businessName: 'Rahul Traders',
                gstin: '22BBBBB0000B1Z5',
                businessType: 'Proprietorship',
                address: '456, Market Road, City'
            }
        });
        console.log('Client created: Rahul Traders (rahul@client.com)');

        // 4. Generate Deadlines
        await generateDeadlinesForClient(clientUser);
        console.log('Deadlines generated for Rahul Traders');

        console.log('-----------------------------------');
        console.log('SEEDING COMPLETE');
        console.log('1. Firm Admin (Org): aman@demo.com / firm123 (Role: firms)');
        console.log('2. CA Employee:      riya@demo.com / firm123');
        console.log('3. Client:           rahul@client.com / client123');
        console.log('-----------------------------------');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
