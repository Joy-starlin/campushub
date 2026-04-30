const express = require('express');
const { query } = require('express-validator');
const apiController = require('../controllers/api.controller');
const { generalLimiter } = require('../middleware/rateLimit');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Public API endpoints for external access
router.use(generalLimiter);

// Get public events
router.get('/events',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 20 }),
    query('category').optional().isIn(['academic', 'social', 'sports', 'cultural', 'religious', 'other']),
    query('search').optional().isLength({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  apiController.getEvents
);

// Get public clubs
router.get('/clubs',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 20 }),
    query('category').optional().isIn(['academic', 'cultural', 'sports', 'religious', 'social', 'professional', 'other']),
    query('search').optional().isLength({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  apiController.getClubs
);

// Get public jobs
router.get('/jobs',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 20 }),
    query('type').optional().isIn(['full-time', 'part-time', 'internship', 'freelance', 'volunteer']),
    query('search').optional().isLength({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  apiController.getJobs
);

// Get universities
router.get('/universities',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('search').optional().isLength({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  apiController.getUniversities
);

// Get university by ID
router.get('/universities/:id',
  apiController.getUniversityBySlug
);


// Get API statistics
router.get('/stats',
  apiController.getPublicStats
);

module.exports = router;
