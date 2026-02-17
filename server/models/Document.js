const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', required: true },
    caId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    fileName: { type: String, required: true },
    originalName: String,
    fileUrl: { type: String, required: true },
    fileType: String,
    fileSize: Number,

    category: { type: String, enum: ['Purchase Invoice', 'Sale Invoice', 'Bank Statement', 'Form 16', 'GST Notice', 'Other', 'Unclassified'], default: 'Unclassified' },
    smartLabel: String, // AI-generated readable description

    extractedData: {
        vendorName: String,
        invoiceDate: String,
        amount: Number,
        gstin: String,
        invoiceNumber: String,
        confidence: Number,
        // Detailed fields from Gemini
        supplierName: String,
        supplierGstin: String,
        recipientName: String,
        recipientGstin: String,
        taxableValue: Number,
        cgstAmount: Number,
        sgstAmount: Number,
        igstAmount: Number,
        totalAmount: Number,
        placeOfSupply: String,
        hsnCodes: [String],
        // New Advanced Fields
        documentType: String,
        cessAmount: Number,
        reverseCharge: Boolean,
        irn: String,
        qrCodePresent: Boolean,
        currency: String,
        exchangeRate: Number,
        originalTotalAmount: Number
    },

    complianceFlags: [
        {
            issue: String,
            severity: { type: String, enum: ['high', 'medium', 'low'] },
            explanation: String
        }
    ],

    transactions: [
        {
            date: String,
            description: String,
            amount: Number,
            type: { type: String, enum: ['debit', 'credit'] },
            matchStatus: { type: String, enum: ['unmatched', 'matched', 'ignored'], default: 'unmatched' },
            matchedDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' }
        }
    ],

    ocrText: String,    // Raw text
    extractedText: String, // Processed text for preview
    riskLevel: { type: String, enum: ['high', 'medium', 'low'], default: 'low' },
    suggestedAction: String,
    aiClassified: { type: Boolean, default: false },
    isDuplicate: { type: Boolean, default: false },
    duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },

    month: Number,
    year: Number,

    deadlineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deadline' },

    status: { type: String, enum: ['uploaded', 'processing', 'processed', 'flagged', 'rejected', 'verified_l1', 'verified_l2'], default: 'uploaded' },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    verifiedBy_l2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt_l2: Date,

    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
