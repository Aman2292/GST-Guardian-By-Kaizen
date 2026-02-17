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

    extractedData: {
        vendorName: String,
        invoiceDate: String,
        amount: Number,
        gstin: String,
        invoiceNumber: String,
        confidence: Number
    },

    ocrText: String,    // Raw text
    extractedText: String, // Processed text for preview
    aiClassified: { type: Boolean, default: false },
    isDuplicate: { type: Boolean, default: false },
    duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },

    month: Number,
    year: Number,

    deadlineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deadline' },

    status: { type: String, enum: ['uploaded', 'processing', 'processed', 'flagged', 'rejected', 'verified_l1'], default: 'uploaded' },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,

    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
