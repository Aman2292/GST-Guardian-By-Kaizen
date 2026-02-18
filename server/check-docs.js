const mongoose = require('mongoose');
const Document = require('./models/Document');
const User = require('./models/User');
require('dotenv').config();

const checkCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: 'rahul@client.com' });
        if (!user) { console.log('User not found'); return; }

        const docs = await Document.find({ clientId: user._id });
        console.log(`Found ${docs.length} documents for ${user.email}`);
        docs.forEach(d => {
            console.log(`- ${d.fileName}: [${d.category}] (ID: ${d._id})`);
        });

    } catch (err) {
        console.log(err);
    } finally {
        mongoose.connection.close();
    }
};

checkCategories();
