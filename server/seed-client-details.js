const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedClient = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'rahul@client.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found:', email);
            return;
        }

        user.phone = '+91 98765 43210';
        user.clientProfile = {
            businessName: 'Rahul Enterprises',
            businessType: 'Proprietorship',
            gstin: '07ABCDE1234F1Z5',
            pan: 'ABCDE1234F',
            address: '123, Tech Park, Bangalore, Karnataka'
        };

        await user.save();
        console.log('Updated user details for:', email);
        console.log(user.clientProfile);

    } catch (err) {
        console.log(err);
    } finally {
        mongoose.connection.close();
    }
};

seedClient();
