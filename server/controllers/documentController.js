const Document = require('../models/Document');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const { extractTextFromBuffer, analyzeWithGemini } = require('../services/ocrService');

// @desc    Upload a Document
// @route   POST /api/documents/upload
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { clientId, category } = req.body;

        let targetClientId = clientId;
        if (req.user.role === 'client') {
            targetClientId = req.user.userId;
        }

        if (!targetClientId) {
            return res.status(400).json({ success: false, message: 'Client ID is required' });
        }

        // 1. Run OCR (Tesseract + PDF Support)
        console.log('--- OCR START ---');
        const fileBuffer = fs.readFileSync(req.file.path);
        const rawText = await extractTextFromBuffer(fileBuffer, req.file.mimetype);
        console.log('--- OCR END (Text Length:', rawText.length, ') ---');

        // 2. Run AI Analysis (Gemini)
        console.log('--- AI START ---');
        const geminiAnalysis = await analyzeWithGemini(rawText);
        console.log('--- AI END (Analysis Success:', !!geminiAnalysis, ') ---');

        // 3. Create Document Entry
        const document = await Document.create({
            firmId: req.user.firmId,
            clientId: targetClientId,
            uploadedBy: req.user.userId,
            deadlineId: req.body.deadlineId || null,

            fileName: req.file.filename,
            originalName: req.file.originalname,
            fileUrl: req.file.path,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            category: category || 'Unclassified',

            // AI Data
            status: geminiAnalysis?.compliance_flags?.length > 0 ? 'flagged' : 'processed',
            ocrText: rawText,
            extractedText: rawText.substring(0, 500) + '...', // Short preview

            extractedData: {
                vendorName: geminiAnalysis?.extracted_data?.supplier_name || geminiAnalysis?.extracted_data?.vendor_name || 'N/A',
                amount: geminiAnalysis?.extracted_data?.total_amount || geminiAnalysis?.extracted_data?.amount || 0,
                invoiceDate: geminiAnalysis?.extracted_data?.invoice_date || '',
                gstin: geminiAnalysis?.extracted_data?.supplier_gstin || '',
                invoiceNumber: geminiAnalysis?.extracted_data?.invoice_number || '',

                supplierName: geminiAnalysis?.extracted_data?.supplier_name || geminiAnalysis?.extracted_data?.vendor_name,
                supplierGstin: geminiAnalysis?.extracted_data?.supplier_gstin,
                recipientName: geminiAnalysis?.extracted_data?.recipient_name,
                recipientGstin: geminiAnalysis?.extracted_data?.recipient_gstin,
                taxableValue: geminiAnalysis?.extracted_data?.taxable_value || geminiAnalysis?.extracted_data?.taxable_amount,
                cgstAmount: geminiAnalysis?.extracted_data?.cgst_amount,
                sgstAmount: geminiAnalysis?.extracted_data?.sgst_amount,
                igstAmount: geminiAnalysis?.extracted_data?.igst_amount,
                cessAmount: geminiAnalysis?.extracted_data?.cess_amount,
                totalAmount: geminiAnalysis?.extracted_data?.total_amount || geminiAnalysis?.extracted_data?.amount,
                placeOfSupply: geminiAnalysis?.extracted_data?.place_of_supply,
                hsnCodes: geminiAnalysis?.extracted_data?.hsn_codes,

                // New Advanced Fields
                documentType: geminiAnalysis?.document_type || geminiAnalysis?.extracted_data?.document_type,
                reverseCharge: geminiAnalysis?.extracted_data?.reverse_charge,
                irn: geminiAnalysis?.extracted_data?.irn,
                qrCodePresent: geminiAnalysis?.extracted_data?.qr_code_present,
                currency: geminiAnalysis?.extracted_data?.currency || 'INR',
                exchangeRate: geminiAnalysis?.extracted_data?.exchange_rate,
                originalTotalAmount: geminiAnalysis?.extracted_data?.original_total_amount
            },
            complianceFlags: geminiAnalysis?.compliance_flags?.map(f => ({
                issue: f.issue,
                severity: f.severity,
                explanation: f.explanation
            })) || [],
            riskLevel: geminiAnalysis?.risk_level || (geminiAnalysis?.compliance_flags?.length > 0 ? 'high' : 'low'),
            suggestedAction: geminiAnalysis?.suggested_action,
            aiClassified: true
        });

        res.status(201).json({ success: true, data: document });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Verify Document (L1)
// @route   PATCH /api/documents/:id/verify
exports.verifyDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        if (document.firmId.toString() !== req.user.firmId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        document.status = 'verified_l1';
        document.verifiedBy = req.user.userId;
        document.verifiedAt = Date.now();

        await document.save();

        res.json({ success: true, data: document, message: 'Document verified (Level 1)' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get Documents
// @route   GET /api/documents
exports.getDocuments = async (req, res) => {
    try {
        let query = { firmId: req.user.firmId };

        // If client, only see own docs
        if (req.user.role === 'client') {
            query.clientId = req.user.userId;
        }
        // If CA, see docs for specific client if rejected, or all assigned? 
        // Let's allow filtering by clientId in query params
        if (req.query.clientId) {
            query.clientId = req.query.clientId;
        }

        const documents = await Document.find(query)
            .populate('uploadedBy', 'name role')
            .populate('verifiedBy', 'name')
            .populate('clientId', 'name clientProfile.businessName')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: documents.length, data: documents });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete Document
// @route   DELETE /api/documents/:id
exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        // Check permission: Only uploader or Admin can delete? 
        // For now, let's say anyone in firm can delete if they have access
        if (document.firmId.toString() !== req.user.firmId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Delete file from filesystem
        // Note: 'public' prefix depends on where we serve static files from
        // Assuming we serve 'uploads' directory directly
        // We'll fix the path in the route setup
        // But for deletion:
        // const filePath = path.join(__dirname, '../../uploads', path.basename(document.url));
        // if (fs.existsSync(filePath)) {
        //     fs.unlinkSync(filePath);
        // }

        await document.deleteOne();

        res.json({ success: true, message: 'Document removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
