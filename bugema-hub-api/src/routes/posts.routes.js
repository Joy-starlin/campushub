const express = require('express');
const { body, param, query } = require('express-validator');
const postsController = require('../controllers/posts.controller');
const { verifyToken, optionalAuth } = require('../middleware/auth');
const { requireVerified, requireMember } = require('../middleware/role');
const { upload } = require('../middleware/upload');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Create new post (verified members only)
router.post('/',
  verifyToken,
  requireVerified,
  requireMember,
  upload.array('images', 5),
  [
    body('title').isLength({ min: 5, max: 200 }).trim()
      .withMessage('Title must be between 5 and 200 characters'),
    body('content').isLength({ min: 10, max: 5000 }).trim()
      .withMessage('Content must be between 10 and 5000 characters'),
    body('category').isIn(['news', 'event', 'club', 'market', 'job', 'lost_found', 'announcement'])
      .withMessage('Invalid category'),
    body('university').optional().isLength({ min: 2, max: 100 }).trim()
      .withMessage('University name must be between 2 and 100 characters'),
    body('isGlobal').optional().isBoolean()
      .withMessage('isGlobal must be a boolean')
  ],
  handleValidationErrors,
  postsController.createPost
);

// Get all posts (public)
router.get('/',
  [
    query('category').optional().isIn(['news', 'event', 'club', 'market', 'job', 'lost_found', 'announcement'])
      .withMessage('Invalid category'),
    query('university').optional().isLength({ min: 2, max: 100 }).trim()
      .withMessage('University name must be between 2 and 100 characters'),
    query('page').optional().isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    query('sort').optional().isIn(['newest', 'popular'])
      .withMessage('Sort must be either newest or popular')
  ],
  handleValidationErrors,
  postsController.getAllPosts
);

// Get single post (public)
router.get('/:id',
  [
    param('id').isUUID().withMessage('Invalid post ID')
  ],
  handleValidationErrors,
  postsController.getPostById
);

// Update post (author or admin only)
router.patch('/:id',
  verifyToken,
  upload.array('images', 5),
  [
    param('id').isUUID().withMessage('Invalid post ID'),
    body('title').optional().isLength({ min: 5, max: 200 }).trim()
      .withMessage('Title must be between 5 and 200 characters'),
    body('content').optional().isLength({ min: 10, max: 5000 }).trim()
      .withMessage('Content must be between 10 and 5000 characters'),
    body('category').optional().isIn(['news', 'event', 'club', 'market', 'job', 'lost_found', 'announcement'])
      .withMessage('Invalid category')
  ],
  handleValidationErrors,
  postsController.updatePost
);

// Delete post (author or admin only)
router.delete('/:id',
  verifyToken,
  [
    param('id').isUUID().withMessage('Invalid post ID')
  ],
  handleValidationErrors,
  postsController.deletePost
);

// Toggle like on post
router.post('/:id/like',
  verifyToken,
  [
    param('id').isUUID().withMessage('Invalid post ID')
  ],
  handleValidationErrors,
  postsController.toggleLike
);

// Add comment to post
router.post('/:id/comment',
  verifyToken,
  [
    param('id').isUUID().withMessage('Invalid post ID'),
    body('content').isLength({ min: 1, max: 1000 }).trim()
      .withMessage('Comment must be between 1 and 1000 characters'),
    body('parentId').optional().isUUID()
      .withMessage('Invalid parent comment ID')
  ],
  handleValidationErrors,
  postsController.addComment
);

// Get comments for post
router.get('/:id/comments',
  [
    param('id').isUUID().withMessage('Invalid post ID'),
    query('page').optional().isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
  ],
  handleValidationErrors,
  postsController.getComments
);

// Toggle bookmark on post
router.post('/:id/bookmark',
  verifyToken,
  [
    param('id').isUUID().withMessage('Invalid post ID')
  ],
  handleValidationErrors,
  postsController.toggleBookmark
);

// Report post
router.post('/:id/report',
  verifyToken,
  [
    param('id').isUUID().withMessage('Invalid post ID'),
    body('reason').isLength({ min: 5, max: 500 }).trim()
      .withMessage('Report reason must be between 5 and 500 characters')
  ],
  handleValidationErrors,
  postsController.reportPost
);

// Get user's bookmarked posts
router.get('/bookmarked',
  verifyToken,
  [
    query('page').optional().isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
  ],
  handleValidationErrors,
  postsController.getBookmarkedPosts
);

module.exports = router;
