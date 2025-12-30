const express = require('express');
const { body, param, query } = require('express-validator');
const { checklistController } = require('../controllers');
const { authenticate, adminOnly, validate } = require('../middlewares');

const router = express.Router();

// Validation rules
const dateValidation = [
  query('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  query('areaId')
    .optional()
    .isMongoId()
    .withMessage('Invalid area ID')
];

const updateEntryValidation = [
  param('taskId').isMongoId().withMessage('Invalid task ID'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean'),
  body('staffName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Staff name cannot exceed 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const saveChecklistValidation = [
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('entries')
    .isArray()
    .withMessage('Entries must be an array'),
  body('entries.*.taskId')
    .isMongoId()
    .withMessage('Invalid task ID in entries'),
  body('entries.*.status')
    .isBoolean()
    .withMessage('Status must be a boolean'),
  body('entries.*.staffName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Staff name cannot exceed 100 characters')
];

// Routes - All require authentication
router.get('/', authenticate, dateValidation, validate, checklistController.getChecklistByDate);
router.get('/statistics', authenticate, dateValidation, validate, checklistController.getStatistics);

// Update single entry
router.put('/entry/:taskId', authenticate, updateEntryValidation, validate, checklistController.updateEntry);

// Save entire checklist
router.post('/save', authenticate, saveChecklistValidation, validate, checklistController.saveChecklist);

// Export routes - ADMIN ONLY (Critical: Staff must NOT access these)
router.get('/export/csv', authenticate, adminOnly, dateValidation, validate, checklistController.exportCSV);
router.get('/export/pdf', authenticate, adminOnly, dateValidation, validate, checklistController.exportPDF);
router.get('/export/docx', authenticate, adminOnly, dateValidation, validate, checklistController.exportDOCX);

// Date range validation
const dateRangeValidation = [
  query('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format'),
  query('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid end date format'),
  query('areaId')
    .optional()
    .isMongoId()
    .withMessage('Invalid area ID'),
  query('hospitalId')
    .optional()
    .isMongoId()
    .withMessage('Invalid hospital ID')
];

// Date range export routes - ADMIN ONLY (exports tasks created within date range)
router.get('/export/range/csv', authenticate, adminOnly, dateRangeValidation, validate, checklistController.exportRangeCSV);
router.get('/export/range/pdf', authenticate, adminOnly, dateRangeValidation, validate, checklistController.exportRangePDF);
router.get('/export/range/docx', authenticate, adminOnly, dateRangeValidation, validate, checklistController.exportRangeDOCX);

// Reports by createdAt date range
router.get('/reports', authenticate, dateRangeValidation, validate, checklistController.getReportsByDateRange);

module.exports = router;

