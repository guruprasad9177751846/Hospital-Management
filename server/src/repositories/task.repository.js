const { Task } = require('../models');

class TaskRepository {
  async create(data) {
    const task = new Task(data);
    return await task.save();
  }

  async findAll(params = {}) {
    const { search, areaId, hospitalId, page = 1, limit = 100 } = params;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { taskId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (areaId) {
      query.area = areaId;
    }

    // If hospitalId is provided, we need to filter by area's hospital
    // First, get all areas that belong to this hospital
    if (hospitalId) {
      const { Area } = require('../models');
      const hospitalAreas = await Area.find({ hospital: hospitalId }).select('_id');
      const areaIds = hospitalAreas.map(a => a._id);
      
      // Filter tasks by these areas OR by direct hospital reference
      if (areaIds.length > 0) {
        query.$or = query.$or || [];
        // Combine with existing search OR conditions
        const searchConditions = query.$or.length > 0 ? [...query.$or] : [];
        query.$and = [
          // Either matches task.hospital or area is in hospital's areas
          {
            $or: [
              { hospital: hospitalId },
              { area: { $in: areaIds } }
            ]
          }
        ];
        // Add search conditions if any
        if (searchConditions.length > 0) {
          query.$and.push({ $or: searchConditions });
        }
        delete query.$or;
      } else {
        // No areas for this hospital, filter by direct hospital reference
        query.hospital = hospitalId;
      }
    }

    const skip = (page - 1) * limit;
    
    // Get tasks with populated area and hospital
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate({
          path: 'area',
          select: 'name code hospital',
          populate: { path: 'hospital', select: 'name code' }
        })
        .populate('hospital', 'name code')
        .sort({ area: 1, order: 1, taskId: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(query)
    ]);

    return {
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id) {
    return await Task.findById(id)
      .populate('area', 'name code')
      .populate('hospital', 'name code')
      .populate('createdBy', 'name email');
  }

  async findByTaskId(taskId, hospitalId = null) {
    const query = { taskId };
    if (hospitalId) {
      query.hospital = hospitalId;
    }
    return await Task.findOne(query);
  }

  async findByTaskIdAndHospital(taskId, hospitalId) {
    const query = { taskId };
    if (hospitalId) {
      query.hospital = hospitalId;
    }
    return await Task.findOne(query);
  }

  async findByArea(areaId, hospitalId = null) {
    const query = { area: areaId, isActive: true };
    if (hospitalId) {
      query.hospital = hospitalId;
    }
    return await Task.find(query)
      .sort({ order: 1, taskId: 1 });
  }

  async countByArea(areaId) {
    return await Task.countDocuments({ area: areaId });
  }

  async update(id, data) {
    return await Task.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('area', 'name code')
     .populate('hospital', 'name code');
  }

  async delete(id) {
    return await Task.findByIdAndDelete(id);
  }
}

module.exports = new TaskRepository();
