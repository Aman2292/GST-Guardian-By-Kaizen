const Document = require('../models/Document');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// @desc    Upload a Document
// @route   POST /api/documents/upload
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { clientId, type, description } = req.body;

        // Ensure clientId is present if uploader is CA
        // If uploader is client, clientId is self
        let targetClientId = clientId;
        if (req.user.role === 'client') {
            targetClientId = req.user.userId;
        }

        if (!targetClientId) {
            return res.status(400).json({ success: false, message: 'Client ID is required' });
        }

        // Create Document Record
        const document = await Document.create({
            firmId: req.user.firmId,
            clientId: targetClientId,
            uploadedBy: req.user.userId,
            name: req.file.originalname,
            type: type || 'General',
            url: `/uploads/${req.file.filename}`, // Local path for now
            status: 'Uploaded',
            metadata: {
                size: req.file.size,
                mimeType: req.file.mimetype
            }
        });

        res.status(201).json({ success: true, data: document });

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
