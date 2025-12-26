const express = require('express');
const router = express.Router();
const staffRecordController = require('../controllers/staffRecord.controller');
const { authenticate } = require('../middlewares/auth');
const { body, param, query } = require('express-validator');
const validate = require('../middlewares/validate');

// All routes require authentication
router.use(authenticate);

// Validation rules
const createRecordValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['observation', 'incident', 'maintenance', 'general', 'patient_feedback', 'supply_request'])
    .withMessage('Invalid category'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('area')
    .optional()
    .isMongoId().withMessage('Invalid area ID')
];

const updateRecordValidation = [
  param('id').isMongoId().withMessage('Invalid record ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('category')
    .optional()
    .isIn(['observation', 'incident', 'maintenance', 'general', 'patient_feedback', 'supply_request'])
    .withMessage('Invalid category'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
];

// Routes
router.get('/', staffRecordController.getRecords);
router.get('/stats', staffRecordController.getStats);
router.get('/:id', [param('id').isMongoId().withMessage('Invalid record ID')], validate, staffRecordController.getRecord);
router.post('/', createRecordValidation, validate, staffRecordController.createRecord);
router.put('/:id', updateRecordValidation, validate, staffRecordController.updateRecord);
router.delete('/:id', [param('id').isMongoId().withMessage('Invalid record ID')], validate, staffRecordController.deleteRecord);

module.exports = router;

