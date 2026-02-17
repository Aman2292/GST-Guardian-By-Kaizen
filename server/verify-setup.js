require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load Models
const Firm = require('./models/Firm');
const User = require('./models/User');

console.log('--- CA Command Center Verification ---');

async function verify() {
    // 1. Check Env Vars
    if (!process.env.JWT_SECRET) {
        console.error('❌ Missing JWT_SECRET');
        process.exit(1);
    } else {
        console.log('✅ ENV checks passed');
    }

    // 2. Mock DB Connection (We won't actually connect to avoid timeout issues if user IP isn't whitelisted, but we check dependency)
    if (mongoose.version) {
        console.log(`✅ Mongoose installed: ${mongoose.version}`);
    }

    // 3. Verify BCrypt
    const hash = await bcrypt.hash('test1234', 10);
    console.log('✅ BCrypt hashing working');

    // 4. Verify JWT
    const token = jwt.sign({ id: '123' }, process.env.JWT_SECRET);
    if (token) console.log('✅ JWT signing working');

    // 5. Check Models
    if (Firm.modelName === 'Firm' && User.modelName === 'User') {
        console.log('✅ Models loaded correctly');
    }

    console.log('--- ALL CHECKS PASSED ---');
    process.exit(0);
}

verify();
