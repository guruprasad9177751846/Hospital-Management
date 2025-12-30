const express = require('express');
const { body } = require('express-validator');
const { authController } = require('../controllers');
const { authenticate, validate } = require('../middlewares');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'staff'])
    .withMessage('Role must be either admin or staff'),
  body('hospital')
    .optional()
    .isMongoId()
    .withMessage('Invalid hospital ID')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('profilePicture')
    .optional({ nullable: true })
    // Allow base64 images, URLs, or null
    .custom((value) => {
      if (value === null || value === '') return true;
      if (typeof value === 'string') {
        // Allow base64 data URLs or regular URLs
        if (value.startsWith('data:image/') || value.startsWith('http://') || value.startsWith('https://')) {
          return true;
        }
      }
      throw new Error('Please provide a valid image (base64 or URL)');
    })
];

// Routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/change-password', authenticate, changePasswordValidation, validate, authController.changePassword);
router.put('/profile', authenticate, updateProfileValidation, validate, authController.updateProfile);

module.exports = router;

