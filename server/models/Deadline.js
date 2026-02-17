const mongoose = require('mongoose');

const DeadlineSchema = new mongoose.Schema({
  firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', required: true },
  caId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  type: { type: String, required: true }, // GSTR1, GSTR3B, etc.
  month: Number,
  year: Number,
  dueDate: { type: Date, required: true },
  
  status: { type: String, enum: ['pending', 'in_progress', 'filed', 'missed'], default: 'pending' },
  filedAt: Date,
  filedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  penaltyApplicable: { type: Boolean, default: false },
  penaltyAmount: Number,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Deadline', DeadlineSchema);
