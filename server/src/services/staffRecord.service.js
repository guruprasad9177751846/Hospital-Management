const staffRecordRepository = require('../repositories/staffRecord.repository');
const { AppError } = require('../middlewares/errorHandler');
const mongoose = require('mongoose');

class StaffRecordService {
  async getAllRecords(filters = {}, options = {}) {
    return staffRecordRepository.findAll(filters, options);
  }

  async getRecordsByUser(userId, filters = {}, options = {}) {
    return staffRecordRepository.findByUser(userId, filters, options);
  }

  async getRecordById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid record ID', 400);
    }

    const record = await staffRecordRepository.findById(id);
    
    if (!record) {
      throw new AppError('Record not found', 404);
    }

    // Everyone can view all records
    return record;
  }

  async createRecord(data, userId) {
    const recordData = {
      ...data,
      createdBy: userId
    };

    return staffRecordRepository.create(recordData);
  }

  async updateRecord(id, data, userId, isAdmin = false) {
    const record = await this.getRecordById(id);

    // Only creator or admin can update
    if (!isAdmin && record.createdBy._id.toString() !== userId.toString()) {
      throw new AppError('You can only edit your own records', 403);
    }

    // If resolving the record
    if (data.status === 'resolved' && record.status !== 'resolved') {
      data.resolvedBy = userId;
      data.resolvedAt = new Date();
    }

    return staffRecordRepository.update(id, data);
  }

  async deleteRecord(id, userId, isAdmin = false) {
    const record = await this.getRecordById(id);

    // Only creator or admin can delete
    if (!isAdmin && record.createdBy._id.toString() !== userId.toString()) {
      throw new AppError('You can only delete your own records', 403);
    }

    await staffRecordRepository.delete(id);
    return { message: 'Record deleted successfully' };
  }

  async getStats(userId = null, isAdmin = false) {
    // Admin can see all stats, staff only sees their own
    const targetUserId = isAdmin ? null : userId;
    return staffRecordRepository.getStats(targetUserId);
  }
}

module.exports = new StaffRecordService();

