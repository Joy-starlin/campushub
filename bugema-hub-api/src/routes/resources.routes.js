const express = require('express');
const { body, param, query } = require('express-validator');
const resourcesController = require('../controllers/resources.controller');
const { verifyToken } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Upload resource
router.post('/',
  verifyToken,
  uploadSingle('file'),
  [
    body('title').notEmpty().isLength({ max: 200 }),
    body('description').notEmpty().isLength({ max: 2000 }),
    body('category').isIn(['lecture-notes', 'assignments', 'past-papers', 'study-guides', 'tutorials', 'other']),
    body('subject').notEmpty(),
    body('course').optional().isLength({ max: 100 }),
    body('semester').optional().isLength({ max: 50 }),
    body('year').optional().isInt({ min: 1950, max: new Date().getFullYear() + 5 }),
    body('tags').optional().isArray()
  ],
  handleValidationErrors,
  resourcesController.uploadResource
);

// Get all resources with pagination and filters
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('category').optional().isIn(['lecture-notes', 'assignments', 'past-papers', 'study-guides', 'tutorials', 'other']),
    query('subject').optional().isLength({ min: 1, max: 100 }),
    query('course').optional().isLength({ min: 1, max: 100 }),
    query('search').optional().isLength({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  resourcesController.getAllResources
);

// Get resource by ID
router.get('/:id',
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  resourcesController.getResourceById
);

// Download resource
router.get('/:id/download',
  verifyToken,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  resourcesController.downloadResource
);

// Update resource
router.put('/:id',
  verifyToken,
  [
    param('id').isAlphanumeric(),
    body('title').optional().notEmpty().isLength({ max: 200 }),
    body('description').optional().notEmpty().isLength({ max: 2000 }),
    body('tags').optional().isArray()
  ],
  handleValidationErrors,
  resourcesController.updateResource
);

// Delete resource
router.delete('/:id',
  verifyToken,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  resourcesController.deleteResource
);

// Like/unlike resource
router.post('/:id/like',
  verifyToken,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  resourcesController.toggleLike
);

// Add comment to resource
router.post('/:id/comments',
  verifyToken,
  [
    param('id').isAlphanumeric(),
    body('content').notEmpty().isLength({ max: 500 })
  ],
  handleValidationErrors,
  resourcesController.addComment
);

module.exports = router;
