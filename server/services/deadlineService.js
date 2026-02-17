const Deadline = require('../models/Deadline');
const { getDateObj, getFinancialYear } = require('../utils/dateHelpers');

// Deadlines Configuration
const COMPLIANCE_CALENDAR = [
    { type: 'GSTR-1', day: 11, recurring: true }, // Monthly
    { type: 'GSTR-3B', day: 20, recurring: true }, // Monthly
    { type: 'TDS Payment', day: 7, recurring: true }, // Monthly
    { type: 'ITR Filing', day: 31, month: 7, recurring: false } // Annual (July)
];

const generateDeadlinesForClient = async (client) => {
    const { start, end } = getFinancialYear(); // e.g. 2023, 2024
    const deadlinesToInsert = [];

    // Loop through FY months (April to March)
    // 4,5,6,7,8,9,10,11,12 (Year Start) -> 1,2,3 (Year End)

    const months = [
        { m: 4, y: start }, { m: 5, y: start }, { m: 6, y: start },
        { m: 7, y: start }, { m: 8, y: start }, { m: 9, y: start },
        { m: 10, y: start }, { m: 11, y: start }, { m: 12, y: start },
        { m: 1, y: end }, { m: 2, y: end }, { m: 3, y: end }
    ];

    months.forEach(({ m, y }) => {
        COMPLIANCE_CALENDAR.forEach(compliance => {
            if (compliance.recurring) {
                // For monthly stuff, due date is usually in the NEXT month for the current month's data
                // e.g. April Data -> Due May 11th
                let dueMonth = m + 1;
                let dueYear = y;

                if (dueMonth > 12) {
                    dueMonth = 1;
                    dueYear++;
                }

                const dueDate = getDateObj(compliance.day, dueMonth, dueYear);

                deadlinesToInsert.push({
                    firmId: client.firmId,
                    caId: client.clientProfile.assignedCAId,
                    clientId: client._id,
                    type: compliance.type,
                    month: m,
                    year: y,
                    dueDate: dueDate,
                    status: 'pending'
                });
            } else {
                // One-time annual deadlines
                if (compliance.month === m) {
                    const dueDate = getDateObj(compliance.day, compliance.month, y);
                    deadlinesToInsert.push({
                        firmId: client.firmId,
                        caId: client.clientProfile.assignedCAId,
                        clientId: client._id,
                        type: compliance.type,
                        month: m,
                        year: y,
                        dueDate: dueDate,
                        status: 'pending'
                    });
                }
            }
        });
    });

    if (deadlinesToInsert.length > 0) {
        await Deadline.insertMany(deadlinesToInsert);
        console.log(`Generated ${deadlinesToInsert.length} deadlines for client ${client.name}`);
    }
};

module.exports = { generateDeadlinesForClient };
