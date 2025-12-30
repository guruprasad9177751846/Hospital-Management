const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: [true, 'Task ID is required'],
    trim: true,
    maxlength: [20, 'Task ID cannot exceed 20 characters']
  },
  name: {
    type: String,
    required: [true, 'Task name is required'],
    trim: true,
    maxlength: [200, 'Task name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  area: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area',
    required: [true, 'Area is required']
  },
  // New field: Hospital reference (optional for backward compatibility)
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
taskSchema.index({ taskId: 1 });
taskSchema.index({ area: 1 });
taskSchema.index({ isActive: 1 });
taskSchema.index({ area: 1, order: 1 });
taskSchema.index({ hospital: 1 });
// Compound unique index: taskId unique per hospital
taskSchema.index({ hospital: 1, taskId: 1 }, { unique: true });

module.exports = mongoose.model('Task', taskSchema);

