const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true,
    maxlength: [200, 'Hospital name cannot exceed 200 characters']
  },
  code: {
    type: String,
    required: [true, 'Hospital code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Hospital code cannot exceed 20 characters']
  },
  logoUrl: {
    type: String,
    trim: true,
    default: null
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone cannot exceed 20 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes (code index created by unique: true)
hospitalSchema.index({ isActive: 1 });
hospitalSchema.index({ isDefault: 1 });

// Ensure only one default hospital
hospitalSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Static method to get default hospital
hospitalSchema.statics.getDefault = async function() {
  let defaultHospital = await this.findOne({ isDefault: true });
  
  // If no default exists, create one (for backward compatibility)
  if (!defaultHospital) {
    defaultHospital = await this.findOne({ code: 'DEFAULT' });
    if (!defaultHospital) {
      defaultHospital = await this.create({
        name: 'Sugar & Heart Clinic',
        code: 'DEFAULT',
        isDefault: true,
        isActive: true
      });
    }
  }
  
  return defaultHospital;
};

module.exports = mongoose.model('Hospital', hospitalSchema);

