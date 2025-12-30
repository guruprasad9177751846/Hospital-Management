const mongoose = require('mongoose');

const checklistEntrySchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Task is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  // New field: Hospital reference (optional for backward compatibility)
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    default: null
  },
  status: {
    type: Boolean,
    default: false
  },
  staffName: {
    type: String,
    trim: true,
    maxlength: [100, 'Staff name cannot exceed 100 characters'],
    default: ''
  },
  completedAt: {
    type: Date
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Compound index for unique task per date per hospital
checklistEntrySchema.index({ task: 1, date: 1, hospital: 1 }, { unique: true });
checklistEntrySchema.index({ date: 1 });
checklistEntrySchema.index({ status: 1 });
checklistEntrySchema.index({ hospital: 1 });
checklistEntrySchema.index({ hospital: 1, date: 1 });

// Virtual for formatted date
checklistEntrySchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
});

// Ensure virtuals are included in JSON output
checklistEntrySchema.set('toJSON', { virtuals: true });
checklistEntrySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ChecklistEntry', checklistEntrySchema);

