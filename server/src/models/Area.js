const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Area name is required'],
    trim: true,
    maxlength: [100, 'Area name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Area code is required'],
    uppercase: true,
    trim: true,
    maxlength: [10, 'Area code cannot exceed 10 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
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
  }
}, {
  timestamps: true
});

// Indexes
areaSchema.index({ code: 1 });
areaSchema.index({ name: 1 });
areaSchema.index({ isActive: 1 });
areaSchema.index({ hospital: 1 });
// Compound unique index: area code unique per hospital
areaSchema.index({ hospital: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Area', areaSchema);

