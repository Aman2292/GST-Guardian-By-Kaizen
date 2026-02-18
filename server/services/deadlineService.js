const Deadline = require('../models/Deadline');
const { getDateObj, getFinancialYear } = require('../utils/dateHelpers');

// Deadlines Configuration
const COMPLIANCE_CALENDAR = [
    { type: 'GSTR-1', day: 11, recurring: true }, // Monthly
    { type: 'GSTR-3B', day: 20, recurring: true }, // Monthly
    { type: 'TDS Payment', day: 7, recurring: true }, // Monthly
    { type: 'ITR Filing', day: 31, month: 7, recurring: false } // Annual (July)
];

const Firm = require('../models/Firm');

const generateDeadlinesForClient = async (client) => {
    const { start, end } = getFinancialYear();
    const deadlinesToInsert = [];

    // Fetch Firm Config
    const firm = await Firm.findById(client.firmId);

    // Default config if not set
    const defaultConfig = [
        { type: 'GSTR-1', dueDay: 11 },
        { type: 'GSTR-3B', dueDay: 20 },
        { type: 'TDS Payment', dueDay: 7 }
    ];

    const config = (firm?.complianceConfig && firm.complianceConfig.length > 0)
        ? firm.complianceConfig
        : defaultConfig;

    // Helper to find day for a type
    const getDayForType = (type) => config.find(c => c.type === type)?.dueDay || 11;

    // FEB 2026 GENERATION (Fixed Month Logic as requested)
    const year = 2026;
    const month = 1; // Feb (0-indexed)

    const febDeadlines = [
        { type: 'GSTR-1', day: getDayForType('GSTR-1') },
        { type: 'GSTR-3B', day: getDayForType('GSTR-3B') },
        { type: 'TDS Payment', day: getDayForType('TDS Payment') }
    ];

    febDeadlines.forEach(d => {
        deadlinesToInsert.push({
            firmId: client.firmId,
            caId: client.clientProfile.assignedCAId,
            clientId: client._id,
            type: d.type,
            month: month + 1, // Store as 2 for Feb
            year: year,
            dueDate: new Date(year, month, d.day), // e.g., 2026-02-11
            status: 'pending'
        });
    });

    // Add One-Time Income Tax (March)
    deadlinesToInsert.push({
        firmId: client.firmId,
        caId: client.clientProfile.assignedCAId,
        clientId: client._id,
        type: 'Income Tax Advance',
        month: 3,
        year: 2026,
        dueDate: new Date(2026, 2, 15),
        status: 'pending'
    });

    for (const d of deadlinesToInsert) {
        await Deadline.updateOne(
            // Match key: same client + type + month + year = unique deadline
            { clientId: d.clientId, type: d.type, month: d.month, year: d.year },
            { $set: d },
            { upsert: true }
        );
    }
    console.log(`Upserted ${deadlinesToInsert.length} Feb 2026 deadlines for client ${client.name}`);
};

module.exports = { generateDeadlinesForClient };
