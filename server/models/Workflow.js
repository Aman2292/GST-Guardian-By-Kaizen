const mongoose = require('mongoose');

const WorkflowSchema = new mongoose.Schema({
  firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', required: true },
  caId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  
  steps: [
    {
      stepNumber: Number,
      stepName: String,
      description: String,
      assignedTo: { type: String, enum: ['junior_ca', 'senior_ca'] },
      isDone: { type: Boolean, default: false },
      doneBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      doneAt: Date,
      aiVerified: { type: Boolean, default: false },
      evidence: String
    }
  ],
  
  currentStage: { type: Number, default: 1 },
  overallStatus: { type: String, enum: ['not_started', 'in_progress', 'review', 'complete'], default: 'not_started' },
  completionPercent: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Workflow', WorkflowSchema);
