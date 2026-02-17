const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', required: true },
  caId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  triggerType: { type: String, enum: ['auto', 'manual'], required: true },
  channel: { type: String, enum: ['whatsapp', 'email', 'sms'], required: true },
  
  message: String,
  generatedByAI: { type: Boolean, default: false },
  
  scheduledFor: Date,
  sentAt: Date,
  deliveryStatus: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'], default: 'pending' },
  twilioMessageSid: String
}, { timestamps: true });

module.exports = mongoose.model('Reminder', ReminderSchema);
