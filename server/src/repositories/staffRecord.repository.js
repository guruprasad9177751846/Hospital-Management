const StaffRecord = require('../models/StaffRecord');

class StaffRecordRepository {
  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 20, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const query = StaffRecord.find(filters)
      .populate('area', 'name code')
      .populate('createdBy', 'name email')
      .populate('resolvedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const [records, total] = await Promise.all([
      query.exec(),
      StaffRecord.countDocuments(filters)
    ]);

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id) {
    return StaffRecord.findById(id)
      .populate('area', 'name code')
      .populate('createdBy', 'name email')
      .populate('resolvedBy', 'name email');
  }

  async findByUser(userId, filters = {}, options = {}) {
    return this.findAll({ ...filters, createdBy: userId }, options);
  }

  async create(data) {
    const record = new StaffRecord(data);
    await record.save();
    return this.findById(record._id);
  }

  async update(id, data) {
    await StaffRecord.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    return this.findById(id);
  }

  async delete(id) {
    return StaffRecord.findByIdAndDelete(id);
  }

  async getStats(userId = null) {
    const match = userId ? { createdBy: userId } : {};
    
    const stats = await StaffRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await StaffRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      byStatus: stats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byCategory: categoryStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };
  }
}

module.exports = new StaffRecordRepository();

