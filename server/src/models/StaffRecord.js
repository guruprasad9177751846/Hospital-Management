const mongoose = require('mongoose');

const staffRecordSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['observation', 'incident', 'maintenance', 'general', 'patient_feedback', 'supply_request'],
    default: 'general'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  area: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area'
  },
  // New field: Hospital reference (optional for backward compatibility)
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes
staffRecordSchema.index({ createdBy: 1 });
staffRecordSchema.index({ category: 1 });
staffRecordSchema.index({ status: 1 });
staffRecordSchema.index({ createdAt: -1 });
staffRecordSchema.index({ hospital: 1 });
staffRecordSchema.index({ hospital: 1, createdAt: -1 });

module.exports = mongoose.model('StaffRecord', staffRecordSchema);

