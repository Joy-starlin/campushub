const express = require('express');
const { body, param, query } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard',
  verifyToken,
  isAdmin,
  adminController.getStats
);

// Get all users (admin only)
router.get('/users',
  verifyToken,
  isAdmin,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('role').optional().isIn(['member', 'moderator', 'admin']),
    query('status').optional().isIn(['active', 'suspended', 'deleted']),
    query('search').optional().isLength({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  adminController.getUsers
);

// Suspend user
router.put('/users/:id/suspend',
  verifyToken,
  isAdmin,
  [
    param('id').isAlphanumeric(),
    body('reason').notEmpty().isLength({ max: 500 }),
    body('duration').optional().isInt({ min: 1, max: 365 })
  ],
  handleValidationErrors,
  adminController.suspendUser
);

// Unsuspend user
router.put('/users/:id/unsuspend',
  verifyToken,
  isAdmin,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  adminController.unsuspendUser
);

// Send system announcement
router.post('/announcements',
  verifyToken,
  isAdmin,
  [
    body('title').notEmpty().isLength({ max: 200 }),
    body('message').notEmpty().isLength({ max: 2000 }),
    body('type').isIn(['info', 'warning', 'urgent']),
    body('targetAudience').isIn(['all', 'users', 'moderators', 'admins'])
  ],
  handleValidationErrors,
  adminController.createAnnouncement
);

module.exports = router;
