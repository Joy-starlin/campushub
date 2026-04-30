const express = require('express');
const { body, param, query } = require('express-validator');
const jobsController = require('../controllers/jobs.controller');
const { verifyToken } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Create new job posting
router.post('/',
  verifyToken,
  uploadSingle('companyLogo'),
  [
    body('title').notEmpty().isLength({ max: 100 }),
    body('company').notEmpty().isLength({ max: 100 }),
    body('description').notEmpty().isLength({ max: 2000 }),
    body('requirements').isArray(),
    body('location').notEmpty(),
    body('type').isIn(['full-time', 'part-time', 'internship', 'freelance', 'volunteer']),
    body('salary').optional().isFloat({ min: 0 }),
    body('deadline').optional().isISO8601(),
    body('remote').isBoolean()
  ],
  handleValidationErrors,
  jobsController.createJob
);

// Get all jobs with pagination and filters
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('type').optional().isIn(['full-time', 'part-time', 'internship', 'freelance', 'volunteer']),
    query('location').optional().isLength({ min: 1, max: 100 }),
    query('remote').optional().isBoolean(),
    query('search').optional().isLength({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  jobsController.getAllJobs
);

// Get job by ID
router.get('/:id',
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  jobsController.getJobById
);

// Apply for job
router.post('/:id/apply',
  verifyToken,
  [
    param('id').isAlphanumeric(),
    body('coverLetter').notEmpty().isLength({ max: 1000 })
  ],
  handleValidationErrors,
  jobsController.applyForJob
);

// Get job applicants
router.get('/:id/applicants',
  verifyToken,
  [
    param('id').isAlphanumeric(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  handleValidationErrors,
  jobsController.getJobApplicants
);

// Update job
router.put('/:id',
  verifyToken,
  [
    param('id').isAlphanumeric(),
    body('title').optional().notEmpty().isLength({ max: 100 }),
    body('description').optional().notEmpty().isLength({ max: 2000 }),
    body('status').optional().isIn(['active', 'closed', 'filled'])
  ],
  handleValidationErrors,
  jobsController.updateJob
);

// Delete job
router.delete('/:id',
  verifyToken,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  jobsController.deleteJob
);

module.exports = router;
