const express = require('express');
const { body, param, query } = require('express-validator');
const lostfoundController = require('../controllers/lostfound.controller');
const { verifyToken } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Create new lost/found item
router.post('/',
  verifyToken,
  uploadMultiple('images', 3),
  [
    body('title').notEmpty().isLength({ max: 100 }),
    body('description').notEmpty().isLength({ max: 1000 }),
    body('type').isIn(['lost', 'found']),
    body('category').isIn(['electronics', 'documents', 'clothing', 'accessories', 'books', 'other']),
    body('location').notEmpty(),
    body('date').isISO8601()
  ],
  handleValidationErrors,
  lostfoundController.createItem
);

// Get all items with pagination and filters
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('type').optional().isIn(['lost', 'found']),
    query('category').optional().isIn(['electronics', 'documents', 'clothing', 'accessories', 'books', 'other']),
    query('location').optional().isLength({ min: 1, max: 100 }),
    query('search').optional().isLength({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  lostfoundController.getAllItems
);

// Get item by ID
router.get('/:id',
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  lostfoundController.getItemById
);

// Claim item
router.post('/:id/claim',
  verifyToken,
  [
    param('id').isAlphanumeric(),
    body('description').notEmpty().isLength({ max: 500 })
  ],
  handleValidationErrors,
  lostfoundController.claimItem
);

// Update item
router.put('/:id',
  verifyToken,
  [
    param('id').isAlphanumeric(),
    body('title').optional().notEmpty().isLength({ max: 100 }),
    body('description').optional().notEmpty().isLength({ max: 1000 }),
    body('status').optional().isIn(['active', 'claimed', 'resolved'])
  ],
  handleValidationErrors,
  lostfoundController.updateItem
);

// Delete item
router.delete('/:id',
  verifyToken,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  lostfoundController.deleteItem
);

module.exports = router;
