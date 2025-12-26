const staffRecordService = require('../services/staffRecord.service');

const staffRecordController = {
  // Get all records (everyone can see all records)
  async getRecords(req, res, next) {
    try {
      const { page = 1, limit = 20, category, status, priority, myRecords } = req.query;
      
      const filters = {};
      if (category) filters.category = category;
      
      // Handle comma-separated status values (e.g., "open,in_progress")
      if (status) {
        const statusArray = status.split(',').map(s => s.trim());
        if (statusArray.length > 1) {
          filters.status = { $in: statusArray };
        } else {
          filters.status = status;
        }
      }
      
      if (priority) filters.priority = priority;
      
      // If myRecords=true, filter by current user
      if (myRecords === 'true') {
        filters.createdBy = req.user._id;
      }

      const result = await staffRecordService.getAllRecords(filters, { page: parseInt(page), limit: parseInt(limit) });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  // Get single record (everyone can view)
  async getRecord(req, res, next) {
    try {
      const record = await staffRecordService.getRecordById(req.params.id);
      
      res.json({
        success: true,
        data: { record }
      });
    } catch (error) {
      next(error);
    }
  },

  // Create new record
  async createRecord(req, res, next) {
    try {
      const record = await staffRecordService.createRecord(req.body, req.user._id);
      
      res.status(201).json({
        success: true,
        message: 'Record created successfully',
        data: { record }
      });
    } catch (error) {
      next(error);
    }
  },

  // Update record
  async updateRecord(req, res, next) {
    try {
      const isAdmin = req.user.role === 'admin';
      const record = await staffRecordService.updateRecord(req.params.id, req.body, req.user._id, isAdmin);
      
      res.json({
        success: true,
        message: 'Record updated successfully',
        data: { record }
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete record
  async deleteRecord(req, res, next) {
    try {
      const isAdmin = req.user.role === 'admin';
      await staffRecordService.deleteRecord(req.params.id, req.user._id, isAdmin);
      
      res.json({
        success: true,
        message: 'Record deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get statistics
  async getStats(req, res, next) {
    try {
      const isAdmin = req.user.role === 'admin';
      const stats = await staffRecordService.getStats(req.user._id, isAdmin);
      
      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = staffRecordController;

