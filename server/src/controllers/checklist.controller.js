const { checklistService } = require('../services');

/**
 * Helper to get hospital ID from request
 * Priority: query param > user's hospital > null (service will use default)
 */
const getHospitalId = (req) => {
  if (req.query.hospitalId) {
    return req.query.hospitalId;
  }
  if (req.user && req.user.hospital) {
    return req.user.hospital._id || req.user.hospital;
  }
  return null;
};

class ChecklistController {
  async getChecklistByDate(req, res, next) {
    try {
      const { date, areaId } = req.query;
      const hospitalId = getHospitalId(req);
      const checklist = await checklistService.getChecklistByDate(date, areaId, hospitalId);
      res.json({
        success: true,
        data: { checklist }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateEntry(req, res, next) {
    try {
      const { taskId } = req.params;
      const { date, ...updateData } = req.body;
      const hospitalId = getHospitalId(req);
      const entry = await checklistService.updateChecklistEntry(
        taskId,
        date,
        updateData,
        req.user._id,
        hospitalId
      );
      res.json({
        success: true,
        message: 'Entry updated successfully',
        data: { entry }
      });
    } catch (error) {
      next(error);
    }
  }

  async saveChecklist(req, res, next) {
    try {
      const { date, entries } = req.body;
      const hospitalId = getHospitalId(req);
      const result = await checklistService.saveChecklist(
        entries,
        date,
        req.user._id,
        hospitalId
      );
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async exportCSV(req, res, next) {
    try {
      const { date, areaId } = req.query;
      const hospitalId = getHospitalId(req);
      const result = await checklistService.exportToCSV(date, areaId, hospitalId);
      
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.data);
    } catch (error) {
      next(error);
    }
  }

  async exportPDF(req, res, next) {
    try {
      const { date, areaId } = req.query;
      const hospitalId = getHospitalId(req);
      const result = await checklistService.exportToPDF(date, areaId, hospitalId);
      
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.data);
    } catch (error) {
      next(error);
    }
  }

  async exportDOCX(req, res, next) {
    try {
      const { date, areaId } = req.query;
      const hospitalId = getHospitalId(req);
      const result = await checklistService.exportToDOCX(date, areaId, hospitalId);
      
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.data);
    } catch (error) {
      next(error);
    }
  }

  // Date range exports (filter by createdAt date)
  async exportRangeCSV(req, res, next) {
    try {
      const { startDate, endDate, areaId } = req.query;
      const hospitalId = getHospitalId(req);
      const result = await checklistService.exportRangeToCSV(startDate, endDate, areaId, hospitalId);
      
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.data);
    } catch (error) {
      next(error);
    }
  }

  async exportRangePDF(req, res, next) {
    try {
      const { startDate, endDate, areaId } = req.query;
      const hospitalId = getHospitalId(req);
      const result = await checklistService.exportRangeToPDF(startDate, endDate, areaId, hospitalId);
      
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.data);
    } catch (error) {
      next(error);
    }
  }

  async exportRangeDOCX(req, res, next) {
    try {
      const { startDate, endDate, areaId } = req.query;
      const hospitalId = getHospitalId(req);
      const result = await checklistService.exportRangeToDOCX(startDate, endDate, areaId, hospitalId);
      
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.data);
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const { date } = req.query;
      const hospitalId = getHospitalId(req);
      const statistics = await checklistService.getStatistics(date, hospitalId);
      res.json({
        success: true,
        data: { statistics }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get reports by createdAt date range
  async getReportsByDateRange(req, res, next) {
    try {
      const { startDate, endDate, areaId } = req.query;
      const hospitalId = getHospitalId(req);
      const result = await checklistService.getReportsByDateRange(startDate, endDate, areaId, hospitalId);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChecklistController();

