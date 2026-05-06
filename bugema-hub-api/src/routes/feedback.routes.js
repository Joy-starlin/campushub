const express = require('express');
const { body, param, query } = require('express-validator');
const feedbackController = require('../controllers/feedback.controller');
const { verifyToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Submit feedback
router.post('/',
  verifyToken,
  [
    body('type').isIn(['bug', 'feature', 'improvement', 'complaint', 'praise']),
    body('category').isIn(['general', 'events', 'clubs', 'jobs', 'marketplace', 'study-groups', 'other']),
    body('title').notEmpty().isLength({ max: 100 }),
    body('description').notEmpty().isLength({ max: 2000 }),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('anonymous').isBoolean()
  ],
  handleValidationErrors,
  feedbackController.submitFeedback
);

// Get all feedback (admin/moderator only)
router.get('/',
  verifyToken,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('type').optional().isIn(['bug', 'feature', 'improvement', 'complaint', 'praise']),
    query('status').optional().isIn(['pending', 'in-progress', 'resolved', 'rejected']),
    query('rating').optional().isInt({ min: 1, max: 5 })
  ],
  handleValidationErrors,
  feedbackController.getAllFeedback
);

// Get feedback by ID
router.get('/:id',
  verifyToken,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  feedbackController.getFeedbackById
);

// Update feedback status (admin/moderator only)
router.put('/:id/status',
  verifyToken,
  [
    param('id').isAlphanumeric(),
    body('status').isIn(['pending', 'in-progress', 'resolved', 'rejected']),
    body('adminResponse').optional().isLength({ max: 1000 })
  ],
  handleValidationErrors,
  feedbackController.updateFeedbackStatus
);

// Add response to feedback
router.post('/:id/response',
  verifyToken,
  [
    param('id').isAlphanumeric(),
    body('message').notEmpty().isLength({ max: 1000 })
  ],
  handleValidationErrors,
  feedbackController.addFeedbackResponse
);

// Delete feedback (admin only)
router.delete('/:id',
  verifyToken,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  feedbackController.deleteFeedback
);

module.exports = router;
