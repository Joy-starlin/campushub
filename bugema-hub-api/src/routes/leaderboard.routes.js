const express = require('express');
const { query } = require('express-validator');
const leaderboardController = require('../controllers/leaderboard.controller');
const { verifyToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Get leaderboard rankings
router.get('/',
  [
    query('type').optional().isIn(['points', 'events', 'clubs', 'posts']),
    query('period').optional().isIn(['weekly', 'monthly', 'all-time']),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  leaderboardController.getLeaderboard
);

// Get user ranking
router.get('/user/:userId',
  [
    query('type').optional().isIn(['points', 'events', 'clubs', 'posts']),
    query('period').optional().isIn(['weekly', 'monthly', 'all-time'])
  ],
  handleValidationErrors,
  leaderboardController.getMyRanking
);

// Get current user ranking
router.get('/my-ranking',
  verifyToken,
  [
    query('type').optional().isIn(['points', 'events', 'clubs', 'posts']),
    query('period').optional().isIn(['weekly', 'monthly', 'all-time'])
  ],
  handleValidationErrors,
  leaderboardController.getMyRanking
);


module.exports = router;
