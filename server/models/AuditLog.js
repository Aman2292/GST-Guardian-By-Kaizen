const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: String,
  
  action: { type: String, required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  targetType: { type: String },
  details: Object,
  
  ipAddress: String
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
