const axios = require('axios');
const jwt = require('jsonwebtoken');

const test = async () => {
    try {
        // Hardcoded form previous validation
        const userId = '6994a616a4f87d9c1756f50e';
        const firmId = '6994a616a4f87d9c1756f50a';
        const secret = 'supersecretjwtkey12345';

        const token = jwt.sign({ userId, firmId, role: 'ca' }, secret, { expiresIn: '1h' });
        console.log('Generated Token');

        const url = 'http://localhost:5000/api/ca/documents/grouped';
        console.log(`Hitting ${url}...`);

        const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Response Status:', res.status);
        console.log('Response Data:', JSON.stringify(res.data, null, 2));

    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Response Data:', err.response.data);
        }
    }
};

test();
