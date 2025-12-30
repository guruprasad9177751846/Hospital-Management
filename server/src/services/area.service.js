const { areaRepository } = require('../repositories');
const { AppError } = require('../middlewares/errorHandler');

class AreaService {
  async getAll(params = {}) {
    return await areaRepository.findAll(params);
  }

  async getActive(hospitalId = null) {
    return await areaRepository.findActive(hospitalId);
  }

  async getById(id) {
    const area = await areaRepository.findById(id);
    if (!area) {
      throw new AppError('Area not found', 404);
    }
    return area;
  }

  async create(data, userId) {
    const hospitalId = data.hospital || null;
    
    // Check for duplicate code within the same hospital
    const existing = await areaRepository.findByCode(data.code, hospitalId);
    if (existing) {
      throw new AppError('Area with this code already exists in this hospital', 400);
    }

    return await areaRepository.create({
      ...data,
      createdBy: userId
    });
  }

  async update(id, data) {
    const area = await areaRepository.findById(id);
    if (!area) {
      throw new AppError('Area not found', 404);
    }

    // Check for duplicate code if code is being changed (within same hospital)
    if (data.code && data.code !== area.code) {
      const hospitalId = area.hospital?._id || area.hospital;
      const existing = await areaRepository.findByCode(data.code, hospitalId);
      if (existing) {
        throw new AppError('Area with this code already exists in this hospital', 400);
      }
    }

    return await areaRepository.update(id, data);
  }

  async delete(id) {
    const area = await areaRepository.findById(id);
    if (!area) {
      throw new AppError('Area not found', 404);
    }

    return await areaRepository.delete(id);
  }

  async toggleStatus(id) {
    const area = await areaRepository.findById(id);
    if (!area) {
      throw new AppError('Area not found', 404);
    }

    return await areaRepository.update(id, { isActive: !area.isActive });
  }
}

module.exports = new AreaService();
