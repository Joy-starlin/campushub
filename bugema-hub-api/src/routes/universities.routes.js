const express = require('express');
const { body, param, query } = require('express-validator');
const universitiesController = require('../controllers/universities.controller');
const { verifyToken } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Create university
router.post('/',
  verifyToken,
  uploadSingle('logo'),
  [
    body('name').notEmpty().isLength({ max: 200 }),
    body('shortName').notEmpty().isLength({ max: 50 }),
    body('description').notEmpty().isLength({ max: 2000 }),
    body('location').notEmpty(),
    body('website').optional().isURL(),
    body('email').optional().isEmail(),
    body('phone').optional().isMobilePhone(),
    body('type').isIn(['public', 'private', 'international']),
    body('established').optional().isInt({ min: 1800, max: new Date().getFullYear() })
  ],
  handleValidationErrors,
  universitiesController.createUniversity
);

// Get all universities with pagination and filters
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('type').optional().isIn(['public', 'private', 'international']),
    query('location').optional().isLength({ min: 1, max: 100 }),
    query('search').optional().isLength({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  universitiesController.getAllUniversities
);

// Get university by ID
router.get('/:id',
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  universitiesController.getUniversityById
);

// Get university statistics
router.get('/:id/stats',
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  universitiesController.getUniversityStats
);

// Update university
router.put('/:id',
  verifyToken,
  [
    param('id').isAlphanumeric(),
    body('name').optional().notEmpty().isLength({ max: 200 }),
    body('description').optional().notEmpty().isLength({ max: 2000 }),
    body('website').optional().isURL(),
    body('email').optional().isEmail()
  ],
  handleValidationErrors,
  universitiesController.updateUniversity
);

// Delete university
router.delete('/:id',
  verifyToken,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  universitiesController.deleteUniversity
);

module.exports = router;
