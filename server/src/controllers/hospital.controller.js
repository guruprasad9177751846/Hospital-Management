const hospitalService = require('../services/hospital.service');

class HospitalController {
  async getAll(req, res, next) {
    try {
      const { search, page, limit, includeInactive } = req.query;
      const result = await hospitalService.getAll({ 
        search, 
        page, 
        limit,
        includeInactive: includeInactive === 'true'
      });
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getActive(req, res, next) {
    try {
      const hospitals = await hospitalService.getActive();
      res.json({
        success: true,
        data: { hospitals }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const hospital = await hospitalService.getById(req.params.id);
      res.json({
        success: true,
        data: { hospital }
      });
    } catch (error) {
      next(error);
    }
  }

  async getDefault(req, res, next) {
    try {
      const hospital = await hospitalService.getDefault();
      res.json({
        success: true,
        data: { hospital }
      });
    } catch (error) {
      next(error);
    }
  }

  async getBranding(req, res, next) {
    try {
      // Use user's hospital if available, otherwise use query param or default
      const hospitalId = req.query.hospitalId || req.user?.hospital || null;
      const branding = await hospitalService.getBranding(hospitalId);
      res.json({
        success: true,
        data: { branding }
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const hospital = await hospitalService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Hospital created successfully',
        data: { hospital }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const hospital = await hospitalService.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Hospital updated successfully',
        data: { hospital }
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadLogo(req, res, next) {
    try {
      // The logoUrl should be provided after uploading to external storage
      // This endpoint just updates the reference in the database
      const { logoUrl } = req.body;
      
      if (!logoUrl) {
        return res.status(400).json({
          success: false,
          message: 'Logo URL is required'
        });
      }

      const hospital = await hospitalService.updateLogo(req.params.id, logoUrl);
      res.json({
        success: true,
        message: 'Hospital logo updated successfully',
        data: { hospital }
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await hospitalService.delete(req.params.id);
      res.json({
        success: true,
        message: 'Hospital deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async setDefault(req, res, next) {
    try {
      const hospital = await hospitalService.setDefault(req.params.id);
      res.json({
        success: true,
        message: 'Default hospital updated successfully',
        data: { hospital }
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleStatus(req, res, next) {
    try {
      const hospital = await hospitalService.toggleStatus(req.params.id);
      res.json({
        success: true,
        message: `Hospital ${hospital.isActive ? 'activated' : 'deactivated'} successfully`,
        data: { hospital }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HospitalController();

