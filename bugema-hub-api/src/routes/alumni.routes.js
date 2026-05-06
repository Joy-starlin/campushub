const express = require('express');
const { body, param, query } = require('express-validator');
const alumniController = require('../controllers/alumni.controller');
const { verifyToken } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Create alumni profile
router.post('/profile',
  verifyToken,
  uploadSingle('profilePicture'),
  [
    body('graduationYear').isInt({ min: 1950, max: new Date().getFullYear() + 5 }),
    body('degree').notEmpty(),
    body('major').notEmpty(),
    body('currentCompany').optional().isLength({ max: 100 }),
    body('currentPosition').optional().isLength({ max: 100 }),
    body('industry').optional().isLength({ max: 100 }),
    body('linkedin').optional().isURL(),
    body('bio').optional().isLength({ max: 1000 })
  ],
  handleValidationErrors,
  alumniController.createAlumniProfile
);

// Get all alumni with pagination and filters
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('graduationYear').optional().isInt({ min: 1950, max: new Date().getFullYear() + 5 }),
    query('degree').optional().isLength({ min: 1, max: 100 }),
    query('industry').optional().isLength({ min: 1, max: 100 }),
    query('search').optional().isLength({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  alumniController.getAllAlumni
);

// Get alumni profile by ID
router.get('/:id',
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  alumniController.getAlumniById
);

// Update alumni profile
router.put('/profile',
  verifyToken,
  [
    body('currentCompany').optional().isLength({ max: 100 }),
    body('currentPosition').optional().isLength({ max: 100 }),
    body('industry').optional().isLength({ max: 100 }),
    body('linkedin').optional().isURL(),
    body('bio').optional().isLength({ max: 1000 })
  ],
  handleValidationErrors,
  alumniController.updateAlumniProfile
);

// Connect with alumni
router.post('/:id/connect',
  verifyToken,
  [
    param('id').isAlphanumeric(),
    body('message').optional().isLength({ max: 500 })
  ],
  handleValidationErrors,
  alumniController.connectWithAlumni
);

// Get alumni connections
router.get('/connections',
  verifyToken,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  handleValidationErrors,
  alumniController.getAlumniConnections
);

module.exports = router;
