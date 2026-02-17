const mongoose = require('mongoose');

const FirmSchema = new mongoose.Schema({
  firmName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  },
  gstNumber: { type: String },
  logo: { type: String },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  // Configurable Deadlines
  complianceConfig: [
    {
      type: { type: String, required: true }, // e.g. 'GSTR-1'
      dueDay: { type: Number, required: true } // e.g. 11
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Firm', FirmSchema);
