const { authenticate, authorize, adminOnly } = require('./auth');
const { AppError, errorHandler } = require('./errorHandler');
const validate = require('./validate');
const { 
  injectHospitalContext, 
  validateHospitalAccess, 
  getHospitalFilter, 
  getHospitalIdForCreate 
} = require('./hospitalScope');

module.exports = {
  authenticate,
  authorize,
  adminOnly,
  AppError,
  errorHandler,
  validate,
  injectHospitalContext,
  validateHospitalAccess,
  getHospitalFilter,
  getHospitalIdForCreate
};
