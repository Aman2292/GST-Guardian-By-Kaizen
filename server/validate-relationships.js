const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const validate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        let output = 'MongoDB Connected\n';

        // 1. Find a CA
        const ca = await mongoose.connection.db.collection('users').findOne({ role: 'ca' });
        if (!ca) {
            output += 'No CA found!\n';
            fs.writeFileSync('validation-output.txt', output);
            return;
        }

        output += `\n--- CA User: ${ca.name} ---\n`;
        output += `CA ID: ${ca._id}\n`;
        output += `FirmId: ${ca.firmId} (Type: ${typeof ca.firmId}, Ctor: ${ca.firmId?.constructor?.name})\n`;

        const firmIdObj = ca.firmId;
        const firmIdStr = ca.firmId.toString();

        // 2. Check Documents
        const docsCountObj = await mongoose.connection.db.collection('documents').countDocuments({ firmId: firmIdObj });
        const docsCountStr = await mongoose.connection.db.collection('documents').countDocuments({ firmId: firmIdStr });

        output += `\n--- Documents Check ---\n`;
        output += `Count with ObjectId(${firmIdObj}): ${docsCountObj}\n`;
        output += `Count with String("${firmIdStr}"): ${docsCountStr}\n`;

        // 3. Check Deadlines
        const deadlinesCountObj = await mongoose.connection.db.collection('deadlines').countDocuments({ firmId: firmIdObj });
        const deadlinesCountStr = await mongoose.connection.db.collection('deadlines').countDocuments({ firmId: firmIdStr });

        output += `\n--- Deadlines Check ---\n`;
        output += `Count with ObjectId(${firmIdObj}): ${deadlinesCountObj}\n`;
        output += `Count with String("${firmIdStr}"): ${deadlinesCountStr}\n`;

        fs.writeFileSync('validation-output.txt', output);
        console.log('Validation written to validation-output.txt');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

validate();
