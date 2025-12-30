const express = require('express');
const { body, param } = require('express-validator');
const hospitalController = require('../controllers/hospital.controller');
const { authenticate, adminOnly, validate } = require('../middlewares');

const router = express.Router();

// Validation rules
// Helper to validate logo (base64 or URL)
const isValidLogo = (value) => {
  if (!value) return true; // Optional
  if (value.startsWith('data:image/') && value.includes(';base64,')) return true;
  try {
    new URL(value);
    return true;
  } catch (e) {
    return false;
  }
};

const createHospitalValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Hospital name is required')
    .isLength({ max: 200 })
    .withMessage('Hospital name cannot exceed 200 characters'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Hospital code is required')
    .isLength({ max: 20 })
    .withMessage('Hospital code cannot exceed 20 characters')
    .toUpperCase(),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone cannot exceed 20 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('logoUrl')
    .optional()
    .custom(isValidLogo)
    .withMessage('Please provide a valid image (base64 or URL)'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean')
];

const updateHospitalValidation = [
  param('id').isMongoId().withMessage('Invalid hospital ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Hospital name cannot exceed 200 characters'),
  body('code')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Hospital code cannot exceed 20 characters')
    .toUpperCase(),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone cannot exceed 20 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('logoUrl')
    .optional()
    .custom(isValidLogo)
    .withMessage('Please provide a valid image (base64 or URL)'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const uploadLogoValidation = [
  param('id').isMongoId().withMessage('Invalid hospital ID'),
  body('logoUrl')
    .notEmpty()
    .withMessage('Logo is required')
    .custom((value) => {
      if (!value) return false;
      return isValidLogo(value);
    })
    .withMessage('Please provide a valid image (base64 or URL)')
];

// Public routes (authenticated)
router.get('/active', authenticate, hospitalController.getActive);
router.get('/default', authenticate, hospitalController.getDefault);
router.get('/branding', authenticate, hospitalController.getBranding);

// Admin-only routes
router.get('/', authenticate, adminOnly, hospitalController.getAll);
router.get('/:id', authenticate, adminOnly, param('id').isMongoId().withMessage('Invalid hospital ID'), validate, hospitalController.getById);
router.post('/', authenticate, adminOnly, createHospitalValidation, validate, hospitalController.create);
router.put('/:id', authenticate, adminOnly, updateHospitalValidation, validate, hospitalController.update);
router.delete('/:id', authenticate, adminOnly, param('id').isMongoId().withMessage('Invalid hospital ID'), validate, hospitalController.delete);

// Logo upload - Admin only
router.post('/:id/logo', authenticate, adminOnly, uploadLogoValidation, validate, hospitalController.uploadLogo);

// Set default hospital - Admin only
router.patch('/:id/set-default', authenticate, adminOnly, param('id').isMongoId().withMessage('Invalid hospital ID'), validate, hospitalController.setDefault);

// Toggle hospital status - Admin only
router.patch('/:id/toggle-status', authenticate, adminOnly, param('id').isMongoId().withMessage('Invalid hospital ID'), validate, hospitalController.toggleStatus);

module.exports = router;

