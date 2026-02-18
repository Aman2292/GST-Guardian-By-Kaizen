const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(cookieParser());

// Database Connection
const connectDB = require('./config/db');
connectDB();

// Audit Middleware (after auth, before routes)
const auditMiddleware = require('./middleware/auditMiddleware');

// Routes
app.use('/api/auth', require('./routes/auth'));

// Mount audit middleware for all routes except auth
app.use(auditMiddleware);

app.use('/api/ca', require('./routes/ca'));
app.use('/api/documents', require('./routes/document'));
app.use('/api/vault', require('./routes/vault'));
app.use('/api/firm', require('./routes/firm'));
app.use('/api/client', require('./routes/client'));
app.use('/api/audit', require('./routes/audit'));

// Make uploads folder static
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
