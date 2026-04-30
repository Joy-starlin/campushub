const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimit');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Register new user
router.post('/register', 
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').notEmpty().isLength({ min: 2, max: 50 }),
    body('lastName').notEmpty().isLength({ min: 2, max: 50 }),
    body('country').notEmpty().isLength({ min: 2, max: 100 }),
    body('university').notEmpty().isLength({ min: 2, max: 100 }),
    body('course').notEmpty().isLength({ min: 2, max: 100 }),
    body('year').isInt({ min: 1, max: 10 }),
    body('phone').optional().isMobilePhone()
  ],
  handleValidationErrors,
  authController.register
);

// Login user
router.post('/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  handleValidationErrors,
  authController.login
);

// Refresh token
router.post('/refresh',
  [
    body('refreshToken').notEmpty()
  ],
  handleValidationErrors,
  authController.refreshToken
);

// Logout user
router.post('/logout',
  [
    body('refreshToken').notEmpty()
  ],
  handleValidationErrors,
  authController.logout
);

// Forgot password
router.post('/forgot-password',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail()
  ],
  handleValidationErrors,
  authController.forgotPassword
);

// Verify OTP for password reset
router.post('/verify-otp',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric()
  ],
  handleValidationErrors,
  authController.verifyOtp
);

// Reset password
router.post('/reset-password',
  authLimiter,
  [
    body('resetToken').notEmpty(),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  handleValidationErrors,
  authController.resetPassword
);

// Send student verification email
router.post('/verify-student/email',
  authLimiter,
  [
    body('universityEmail').isEmail().normalizeEmail()
  ],
  handleValidationErrors,
  authController.verifyStudentEmail
);

// Confirm student verification
router.post('/verify-student/confirm',
  authLimiter,
  [
    body('otp').isLength({ min: 6, max: 6 }).isNumeric()
  ],
  handleValidationErrors,
  authController.confirmStudentVerification
);

module.exports = router;
