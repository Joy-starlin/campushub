const express = require('express');
const { body, param, query } = require('express-validator');
const marketplaceController = require('../controllers/marketplace.controller');
const { verifyToken } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Create new marketplace listing
router.post('/',
  verifyToken,
  uploadMultiple('images', 5),
  [
    body('title').notEmpty().isLength({ max: 100 }),
    body('description').notEmpty().isLength({ max: 2000 }),
    body('price').isFloat({ min: 0 }),
    body('category').isIn(['electronics', 'books', 'clothing', 'furniture', 'sports', 'other']),
    body('condition').isIn(['new', 'like-new', 'good', 'fair', 'poor']),
    body('negotiable').isBoolean()
  ],
  handleValidationErrors,
  marketplaceController.createListing
);

// Get all listings with pagination and filters
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('category').optional().isIn(['electronics', 'books', 'clothing', 'furniture', 'sports', 'other']),
    query('condition').optional().isIn(['new', 'like-new', 'good', 'fair', 'poor']),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('search').optional().isLength({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  marketplaceController.getAllListings
);

// Get listing by ID
router.get('/:id',
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  marketplaceController.getListingById
);

// Update listing
router.put('/:id',
  verifyToken,
  [
    param('id').isAlphanumeric(),
    body('title').optional().notEmpty().isLength({ max: 100 }),
    body('description').optional().notEmpty().isLength({ max: 2000 }),
    body('price').optional().isFloat({ min: 0 }),
    body('status').optional().isIn(['active', 'sold', 'reserved'])
  ],
  handleValidationErrors,
  marketplaceController.updateListing
);

// Delete listing
router.delete('/:id',
  verifyToken,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  marketplaceController.deleteListing
);

module.exports = router;
