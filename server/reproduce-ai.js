const mongoose = require('mongoose');
require('dotenv').config();
const { analyzeWithGemini } = require('./services/ocrService');
const Document = require('./models/Document');

async function reproduce() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const doc = await Document.findOne().sort({ createdAt: -1 });

        const ocrText = doc?.ocrText || `
            TAX INVOICE
            IRN: 8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e
            Supplier: ADVANCED GST SOLUTIONS LLP
            GSTIN: 27ABCDE1234F1Z5
            Recipient: TEST CLIENT PVT LTD
            Recipient GSTIN: 27XYZAB5678C1Z9
            Date: 18-02-2026
            Invoice No: GST-2026-999
            
            Item: Consulting Services
            HSN: 998311
            Taxable Value: 10000.00
            IGST @ 18%: 1800.00
            Cess: 200.00
            Total Amount: 12000.00
            
            Reverse Charge: No
            QR Code present for E-invoice tracking.
        `;

        console.log('--- TESTING ADVANCED GST INTELLIGENCE ---');
        console.log('Input Snippet:', ocrText.trim().substring(0, 150) + '...');

        try {
            const result = await analyzeWithGemini(ocrText);
            console.log('\nFINAL EXTRACTION RESULT:');
            console.log(JSON.stringify(result, null, 2));

            // Check for new fields
            const data = result.extracted_data;
            console.log('\n--- DATA VALIDATION ---');
            console.log('Document Type:', result.document_type);
            console.log('Supplier Name:', data.supplier_name);
            console.log('Cess Amount:', data.cess_amount);
            console.log('IRN Detected:', data.irn ? 'YES' : 'NO');
            console.log('QR Code Detection:', data.qr_code_present ? 'YES' : 'NO');

            if (result.compliance_flags.length > 0) {
                console.log('\n--- COMPLIANCE CHECKS ---');
                result.compliance_flags.forEach(f => {
                    console.log(`- [${f.severity.toUpperCase()}] ${f.issue}: ${f.explanation}`);
                });
            }

        } catch (err) {
            console.error('REPRODUCTION CRITICAL FAILURE:', err);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

reproduce();
