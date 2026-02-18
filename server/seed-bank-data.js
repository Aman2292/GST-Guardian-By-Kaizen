const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Document = require('./models/Document');
const Firm = require('./models/Firm');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection failed', err);
        process.exit(1);
    }
};

const seedBankData = async () => {
    await connectDB();

    try {
        const clientEmail = 'rahul@client.com';
        const client = await User.findOne({ email: clientEmail });

        if (!client) {
            console.log('Client Rahul not found!');
            process.exit(1);
        }

        console.log(`Seeding data for: ${client.name} (${client._id})`);

        // Create Jan Bank Statement
        const bankData = {
            firmId: client.firmId,
            clientId: client._id,
            uploadedBy: client._id,
            fileName: 'HDFC_Bank_Statement_Jan_2026.pdf',
            originalName: 'HDFC_Bank_Statement_Jan_2026.pdf',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Dummy URL
            fileType: 'application/pdf',
            fileSize: 1024 * 500,
            category: 'Bank Statement',
            smartLabel: 'HDFC Bank Statement - Jan 2026',
            status: 'processed',
            uploadedAt: new Date('2026-01-31'),
            aiClassified: true,
            extractedData: {
                documentType: 'Bank Statement',
                totalAmount: 145000,
                invoiceDate: '31/01/2026'
            },
            analysisResult: {
                spendingTrend: [
                    { month: 'Nov', amount: 48000 },
                    { month: 'Dec', amount: 52000 },
                    { month: 'Jan', amount: 65000 }
                ],
                anomalies: [
                    { date: '15 Jan', description: 'Large Cash Withdrawal', amount: 25000, severity: 'medium' }
                ],
                categories: [
                    { name: 'Office Rent', amount: 25000, gstInput: 'Eligible', color: '#6366f1' },
                    { name: 'Marketing', amount: 15000, gstInput: 'Eligible', color: '#8b5cf6' },
                    { name: 'Travel', amount: 8000, gstInput: 'Ineligible', color: '#ec4899' },
                    { name: 'Software', amount: 5000, gstInput: 'Eligible', color: '#10b981' }
                ],
                summary: "Spending increased by 25% compared to Dec. Ensure travel expenses are verified."
            }
        };

        const existingDoc = await Document.findOne({
            clientId: client._id,
            fileName: bankData.fileName
        });

        if (!existingDoc) {
            await Document.create(bankData);
            console.log('Created Bank Statement for Jan 2026');
        } else {
            console.log('Bank Statement already exists');
        }

        // Create Sales Invoices for Jan
        const invoices = [
            {
                vendor: 'Client A', amount: 12000, date: '2026-01-05', type: 'Sale Invoice', gstin: '27AAAAA0000A1Z5'
            },
            {
                vendor: 'Client B', amount: 8500, date: '2026-01-12', type: 'Sale Invoice', gstin: '27BBBBB0000B1Z4'
            },
            {
                vendor: 'Hosting Services', amount: 2500, date: '2026-01-20', type: 'Purchase Invoice', gstin: '27CCCCC0000C1Z3'
            }
        ];

        for (const inv of invoices) {
            const docName = `${inv.type.replace(' ', '_')}_${inv.vendor.replace(' ', '_')}.pdf`;
            const exists = await Document.findOne({ clientId: client._id, fileName: docName });

            if (!exists) {
                await Document.create({
                    firmId: client.firmId,
                    clientId: client._id,
                    uploadedBy: client._id,
                    fileName: docName,
                    originalName: docName,
                    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                    fileType: 'application/pdf',
                    fileSize: 1024 * 100,
                    category: inv.type,
                    smartLabel: `${inv.type} - ${inv.vendor}`,
                    status: 'processed',
                    uploadedAt: new Date(inv.date),
                    aiClassified: true,
                    extractedData: {
                        totalAmount: inv.amount,
                        invoiceDate: new Date(inv.date).toLocaleDateString()
                    }
                });
                console.log(`Created ${inv.type}: ${inv.vendor}`);
            }
        }

        console.log('Seeding Complete');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedBankData();
