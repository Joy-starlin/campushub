const express = require('express');
const { body, param, query } = require('express-validator');
const multer = require('multer');
const usersController = require('../controllers/users.controller');
const { verifyToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Get current user's full profile
router.get('/me', 
  verifyToken, 
  usersController.getCurrentUserProfile
);

// Get public user profile by username
router.get('/:username', 
  [
    param('username').isLength({ min: 3, max: 30 }).withMessage('Invalid username')
  ],
  handleValidationErrors,
  usersController.getPublicProfile
);

// Update current user's profile
router.patch('/me', 
  verifyToken,
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 }
  ]),
  [
    body('firstName').optional().isLength({ min: 2, max: 50 }).trim(),
    body('lastName').optional().isLength({ min: 2, max: 50 }).trim(),
    body('bio').optional().isLength({ max: 500 }).trim(),
    body('course').optional().isLength({ min: 2, max: 100 }).trim(),
    body('year').optional().isInt({ min: 1, max: 10 }),
    body('phone').optional().isMobilePhone(),
    body('language').optional().isIn(['en', 'fr', 'sw', 'ar'])
  ],
  handleValidationErrors,
  usersController.updateProfile
);

// Update privacy settings
router.patch('/me/privacy', 
  verifyToken,
  [
    body('profileVisibility').isIn(['public', 'members', 'private'])
      .withMessage('Invalid privacy setting')
  ],
  handleValidationErrors,
  usersController.updatePrivacy
);

// Update language preference
router.patch('/me/language', 
  verifyToken,
  [
    body('language').isIn(['en', 'fr', 'sw', 'ar'])
      .withMessage('Invalid language')
  ],
  handleValidationErrors,
  usersController.updateLanguage
);

// Delete user account (soft delete)
router.delete('/me', 
  verifyToken,
  [
    body('password').notEmpty().withMessage('Password confirmation required')
  ],
  handleValidationErrors,
  usersController.deleteAccount
);

// Search users
router.get('/search', 
  verifyToken,
  [
    query('q').optional().isLength({ min: 2, max: 100 }).trim(),
    query('university').optional().isLength({ min: 2, max: 100 }).trim(),
    query('country').optional().isLength({ min: 2, max: 100 }).trim(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  handleValidationErrors,
  usersController.searchUsers
);

// Follow a user
router.post('/:id/follow', 
  verifyToken,
  [
    param('id').isUUID().withMessage('Invalid user ID')
  ],
  handleValidationErrors,
  usersController.followUser
);

// Unfollow a user
router.delete('/:id/unfollow', 
  verifyToken,
  [
    param('id').isUUID().withMessage('Invalid user ID')
  ],
  handleValidationErrors,
  usersController.unfollowUser
);

// Get user's followers
router.get('/me/followers', 
  verifyToken,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  handleValidationErrors,
  usersController.getFollowers
);

// Get users that current user is following
router.get('/me/following', 
  verifyToken,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  handleValidationErrors,
  usersController.getFollowing
);

module.exports = router;
