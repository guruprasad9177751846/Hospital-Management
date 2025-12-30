const { areaService } = require('../services');

class AreaController {
  async getAll(req, res, next) {
    try {
      const { search, page, limit, hospitalId } = req.query;
      const result = await areaService.getAll({ search, page, limit, hospitalId });
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
      const { hospitalId } = req.query;
      const areas = await areaService.getActive(hospitalId);
      res.json({
        success: true,
        data: { areas }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const area = await areaService.getById(req.params.id);
      res.json({
        success: true,
        data: { area }
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const area = await areaService.create(req.body, req.user._id);
      res.status(201).json({
        success: true,
        message: 'Area created successfully',
        data: { area }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const area = await areaService.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Area updated successfully',
        data: { area }
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await areaService.delete(req.params.id);
      res.json({
        success: true,
        message: 'Area deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleStatus(req, res, next) {
    try {
      const area = await areaService.toggleStatus(req.params.id);
      res.json({
        success: true,
        message: 'Area status updated successfully',
        data: { area }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AreaController();
