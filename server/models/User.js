const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ca', 'client'], required: true },
  phone: { type: String },
  
  // CA Profile
  caProfile: {
    membershipNumber: String,
    specialization: String,
    isAdmin: { type: Boolean, default: false },
    clientCount: { type: Number, default: 0 }
  },

  // Client Profile
  clientProfile: {
    assignedCAId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    businessName: String,
    gstin: String,
    businessType: String,
    pan: String,
    address: String,
    onboardedAt: Date
  },

  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
