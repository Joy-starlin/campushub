const express = require('express');
const { body, param, query } = require('express-validator');
const clubsController = require('../controllers/clubs.controller');
const { verifyToken } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Create new club
router.post('/',
  verifyToken,
  uploadSingle('logo'),
  [
    body('name').notEmpty().isLength({ max: 100 }),
    body('description').notEmpty().isLength({ max: 2000 }),
    body('category').isIn(['academic', 'cultural', 'sports', 'religious', 'social', 'professional', 'other']),
    body('meetingSchedule').optional().isLength({ max: 200 }),
    body('requirements').optional().isArray()
  ],
  handleValidationErrors,
  clubsController.createClub
);

// Get all clubs with pagination and filters
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('category').optional().isIn(['academic', 'cultural', 'sports', 'religious', 'social', 'professional', 'other']),
    query('search').optional().isLength({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  clubsController.getAllClubs
);

// Get club by ID
router.get('/:id',
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  clubsController.getClubById
);

// Join club
router.post('/:id/join',
  verifyToken,
  [
    param('id').isAlphanumeric(),
    body('message').optional().isLength({ max: 500 })
  ],
  handleValidationErrors,
  clubsController.joinClub
);

// Leave club
router.delete('/:id/join',
  verifyToken,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  clubsController.leaveClub
);

// Get club members
router.get('/:id/members',
  verifyToken,
  [
    param('id').isAlphanumeric(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  handleValidationErrors,
  clubsController.getClubMembers
);

// Update club
router.put('/:id',
  verifyToken,
  [
    param('id').isAlphanumeric(),
    body('name').optional().notEmpty().isLength({ max: 100 }),
    body('description').optional().notEmpty().isLength({ max: 2000 }),
    body('category').optional().isIn(['academic', 'cultural', 'sports', 'religious', 'social', 'professional', 'other']),
    body('meetingSchedule').optional().isLength({ max: 200 })
  ],
  handleValidationErrors,
  clubsController.updateClub
);

// Delete club
router.delete('/:id',
  verifyToken,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  clubsController.deleteClub
);

module.exports = router;
