const { Hospital } = require('../models');

class HospitalRepository {
  async create(data) {
    const hospital = new Hospital(data);
    return await hospital.save();
  }

  async findAll(params = {}) {
    const { search, page = 1, limit = 50, includeInactive = false } = params;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    if (!includeInactive) {
      query.isActive = true;
    }

    const skip = (page - 1) * limit;
    
    const [hospitals, total] = await Promise.all([
      Hospital.find(query)
        .sort({ isDefault: -1, name: 1 })
        .skip(skip)
        .limit(limit),
      Hospital.countDocuments(query)
    ]);

    return {
      hospitals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findActive() {
    return await Hospital.find({ isActive: true }).sort({ isDefault: -1, name: 1 });
  }

  async findById(id) {
    return await Hospital.findById(id);
  }

  async findByCode(code) {
    return await Hospital.findOne({ code: code.toUpperCase() });
  }

  async findDefault() {
    return await Hospital.getDefault();
  }

  async update(id, data) {
    return await Hospital.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
  }

  async updateLogo(id, logoUrl) {
    return await Hospital.findByIdAndUpdate(
      id,
      { logoUrl, updatedAt: new Date() },
      { new: true }
    );
  }

  async delete(id) {
    // Prevent deleting default hospital
    const hospital = await Hospital.findById(id);
    if (hospital && hospital.isDefault) {
      throw new Error('Cannot delete default hospital');
    }
    return await Hospital.findByIdAndDelete(id);
  }

  async setDefault(id) {
    // First, unset current default
    await Hospital.updateMany({}, { isDefault: false });
    // Then set new default
    return await Hospital.findByIdAndUpdate(
      id,
      { isDefault: true, updatedAt: new Date() },
      { new: true }
    );
  }
}

module.exports = new HospitalRepository();

