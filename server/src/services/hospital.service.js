const hospitalRepository = require('../repositories/hospital.repository');
const { AppError } = require('../middlewares/errorHandler');

class HospitalService {
  async getAll(params = {}) {
    return await hospitalRepository.findAll(params);
  }

  async getActive() {
    return await hospitalRepository.findActive();
  }

  async getById(id) {
    const hospital = await hospitalRepository.findById(id);
    if (!hospital) {
      throw new AppError('Hospital not found', 404);
    }
    return hospital;
  }

  async getByCode(code) {
    const hospital = await hospitalRepository.findByCode(code);
    if (!hospital) {
      throw new AppError('Hospital not found', 404);
    }
    return hospital;
  }

  async getDefault() {
    return await hospitalRepository.findDefault();
  }

  async create(data) {
    // Check for duplicate code
    const existing = await hospitalRepository.findByCode(data.code);
    if (existing) {
      throw new AppError('Hospital with this code already exists', 400);
    }

    return await hospitalRepository.create(data);
  }

  async update(id, data) {
    const hospital = await hospitalRepository.findById(id);
    if (!hospital) {
      throw new AppError('Hospital not found', 404);
    }

    // Check for duplicate code if code is being changed
    if (data.code && data.code !== hospital.code) {
      const existing = await hospitalRepository.findByCode(data.code);
      if (existing) {
        throw new AppError('Hospital with this code already exists', 400);
      }
    }

    // Prevent changing isDefault to false for default hospital without setting another
    if (hospital.isDefault && data.isDefault === false) {
      throw new AppError('Cannot unset default hospital. Set another hospital as default first.', 400);
    }

    return await hospitalRepository.update(id, data);
  }

  async updateLogo(id, logoUrl) {
    const hospital = await hospitalRepository.findById(id);
    if (!hospital) {
      throw new AppError('Hospital not found', 404);
    }

    return await hospitalRepository.updateLogo(id, logoUrl);
  }

  async delete(id) {
    const hospital = await hospitalRepository.findById(id);
    if (!hospital) {
      throw new AppError('Hospital not found', 404);
    }

    if (hospital.isDefault) {
      throw new AppError('Cannot delete default hospital', 400);
    }

    return await hospitalRepository.delete(id);
  }

  async setDefault(id) {
    const hospital = await hospitalRepository.findById(id);
    if (!hospital) {
      throw new AppError('Hospital not found', 404);
    }

    if (!hospital.isActive) {
      throw new AppError('Cannot set inactive hospital as default', 400);
    }

    return await hospitalRepository.setDefault(id);
  }

  async toggleStatus(id) {
    const hospital = await hospitalRepository.findById(id);
    if (!hospital) {
      throw new AppError('Hospital not found', 404);
    }

    if (hospital.isDefault && hospital.isActive) {
      throw new AppError('Cannot deactivate default hospital', 400);
    }

    return await hospitalRepository.update(id, { isActive: !hospital.isActive });
  }

  /**
   * Get hospital branding info (logo, name) for use in exports/UI
   * Returns default hospital info if hospitalId is not provided
   */
  async getBranding(hospitalId = null) {
    let hospital;
    
    if (hospitalId) {
      hospital = await hospitalRepository.findById(hospitalId);
    }
    
    if (!hospital) {
      hospital = await hospitalRepository.findDefault();
    }

    return {
      _id: hospital._id,
      name: hospital.name,
      code: hospital.code,
      logoUrl: hospital.logoUrl,
      address: hospital.address,
      phone: hospital.phone,
      email: hospital.email
    };
  }
}

module.exports = new HospitalService();

