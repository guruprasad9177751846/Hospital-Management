const { Area } = require('../models');

class AreaRepository {
  async create(data) {
    const area = new Area(data);
    return await area.save();
  }

  async findAll(params = {}) {
    const { search, page = 1, limit = 50, hospitalId } = params;
    
    const query = {};
    
    // Hospital filter (optional for backward compatibility)
    if (hospitalId) {
      query.hospital = hospitalId;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [areas, total] = await Promise.all([
      Area.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .populate('hospital', 'name code'),
      Area.countDocuments(query)
    ]);

    return {
      areas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findActive(hospitalId = null) {
    const query = { isActive: true };
    if (hospitalId) {
      query.hospital = hospitalId;
    }
    return await Area.find(query)
      .sort({ name: 1 })
      .populate('hospital', 'name code');
  }

  async findById(id) {
    return await Area.findById(id)
      .populate('createdBy', 'name email')
      .populate('hospital', 'name code');
  }

  async findByCode(code, hospitalId = null) {
    const query = { code: code.toUpperCase() };
    if (hospitalId) {
      query.hospital = hospitalId;
    }
    return await Area.findOne(query);
  }

  async update(id, data) {
    return await Area.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('hospital', 'name code');
  }

  async delete(id) {
    return await Area.findByIdAndDelete(id);
  }
}

module.exports = new AreaRepository();
