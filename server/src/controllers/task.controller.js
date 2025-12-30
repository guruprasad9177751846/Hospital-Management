const { taskService } = require('../services');

class TaskController {
  async getAll(req, res, next) {
    try {
      const { search, areaId, hospitalId, page, limit } = req.query;
      const result = await taskService.getAll({ search, areaId, hospitalId, page, limit });
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const task = await taskService.getById(req.params.id);
      res.json({
        success: true,
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const task = await taskService.create(req.body, req.user._id);
      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const task = await taskService.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Task updated successfully',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await taskService.delete(req.params.id);
      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleStatus(req, res, next) {
    try {
      const task = await taskService.toggleStatus(req.params.id);
      res.json({
        success: true,
        message: 'Task status updated successfully',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
