const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadDocument, uploadBulkDocuments, getDocuments, deleteDocument, verifyDocument, verifyDocumentL2 } = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const { isFirmAdmin } = require('../middleware/roleCheck');

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// All routes require auth
router.use(authMiddleware);

router.post('/upload', upload.single('file'), uploadDocument);
router.post('/upload-bulk', upload.array('files', 20), uploadBulkDocuments);
router.get('/', getDocuments);
router.patch('/:id/verify', verifyDocument);
router.patch('/:id/verify-l2', isFirmAdmin, verifyDocumentL2);
router.delete('/:id', deleteDocument);

module.exports = router;
