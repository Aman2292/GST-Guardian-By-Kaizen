const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', required: true, index: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  performedByName: String, // Denormalized for faster queries
  role: { type: String, enum: ['firms', 'ca', 'client'], required: true },

  // Action Details
  action: { type: String, required: true, enum: ['CREATE', 'UPDATE', 'DELETE', 'VERIFY', 'UPLOAD', 'OTHER'] },
  httpMethod: { type: String, enum: ['POST', 'PUT', 'PATCH', 'DELETE'] },
  resource: { type: String, required: true }, // e.g., 'Document', 'Client', 'Deadline'
  resourceId: { type: mongoose.Schema.Types.ObjectId },

  // Change Tracking
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },

  // Request Metadata
  endpoint: String, // e.g., '/api/documents/upload'
  ipAddress: String,
  userAgent: String,

  // Legacy fields (for backward compatibility)
  targetId: { type: mongoose.Schema.Types.ObjectId },
  targetType: { type: String },
  details: Object
}, { timestamps: true });

// Indexes for fast queries
AuditLogSchema.index({ firmId: 1, createdAt: -1 });
AuditLogSchema.index({ performedBy: 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
