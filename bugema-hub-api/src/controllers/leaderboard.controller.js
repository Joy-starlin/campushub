const { 
  getDoc, 
  getCollection, 
  createDoc, 
  updateDoc
} = require('../utils/db.helpers');
const { 
  USERS, 
  USER_POINTS, 
  USER_BADGES,
  LEADERBOARD 
} = require('../utils/collections');
const { 
  successResponse, 
  errorResponse 
} = require('../utils/response');

/**
 * Get public leaderboard with rankings
 */
const getLeaderboard = async (req, res) => {
  try {
    const { 
      period = 'alltime', 
      university, 
      country, 
      page = 1, 
      limit = 100 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return errorResponse(res, 'Invalid pagination parameters', 400);
    }

    if (!['weekly', 'monthly', 'alltime'].includes(period)) {
      return errorResponse(res, 'Invalid period. Must be weekly, monthly, or alltime', 400);
    }

    // Get leaderboard entries
    let leaderboardEntries;
    if (period === 'alltime') {
      leaderboardEntries = await getCollection(LEADERBOARD, [
        ['period', '==', 'alltime']
      ]);
    } else {
      // For weekly/monthly, we need to get current period entries
      const now = new Date();
      let periodKey;
      
      if (period === 'weekly') {
        const weekStart = getWeekStart(now);
        periodKey = `weekly`;
      } else {
        const monthStart = getMonthStart(now);
        periodKey = `monthly`;
      }
      
      leaderboardEntries = await getCollection(LEADERBOARD, [
        ['period', '==', periodKey]
      ]);
    }

    // Sort by points (highest first)
    leaderboardEntries.sort((a, b) => b.points - a.points);

    // Apply filters
    let filteredEntries = leaderboardEntries;
    
    if (university) {
      // Filter by university - need to get user details
      const userIds = filteredEntries.map(entry => entry.userId);
      const users = await getCollection(USERS, [
        ['uid', 'in', userIds],
        ['university', '==', university]
      ]);
      const filteredUserIds = users.map(user => user.uid);
      filteredEntries = filteredEntries.filter(entry => filteredUserIds.includes(entry.userId));
    }
    
    if (country) {
      // Filter by country - need to get user details
      const userIds = filteredEntries.map(entry => entry.userId);
      const users = await getCollection(USERS, [
        ['uid', 'in', userIds],
        ['country', '==', country]
      ]);
      const filteredUserIds = users.map(user => user.uid);
      filteredEntries = filteredEntries.filter(entry => filteredUserIds.includes(entry.userId));
    }

    // Get user details for top entries
    const topEntries = filteredEntries.slice(0, 100); // Limit to top 100
    const userIds = topEntries.map(entry => entry.userId);
    const users = await getCollection(USERS, [
      ['uid', 'in', userIds]
    ]);

    // Get user badges for top entries
    const userBadgesMap = new Map();
    for (const entry of topEntries) {
      const userBadges = await getCollection(USER_BADGES, [
        ['userId', '==', entry.userId]
      ]);
      userBadgesMap.set(entry.userId, userBadges);
    }

    // Combine data and calculate ranks
    const rankings = [];
    let currentRank = 1;
    let previousPoints = null;

    for (let i = 0; i < topEntries.length; i++) {
      const entry = topEntries[i];
      const user = users.find(u => u.uid === entry.userId);
      
      if (!user) continue;

      // Handle ties (same points = same rank)
      if (previousPoints !== null && entry.points < previousPoints) {
        currentRank = i + 1;
      }

      // Get user's top badge (most recent or highest rarity)
      const userBadges = userBadgesMap.get(entry.userId) || [];
      const topBadge = getTopBadge(userBadges);

      rankings.push({
        rank: currentRank,
        userId: entry.userId,
        name: `${user.firstName} ${user.lastName}`,
        username: user.username,
        avatar: user.avatar,
        university: user.university,
        country: user.country,
        points: entry.points,
        topBadge: topBadge,
        isCurrentUser: req.user && req.user.id === entry.userId
      });

      previousPoints = entry.points;
    }

    // Apply pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedRankings = rankings.slice(startIndex, endIndex);

    return successResponse(res, {
      rankings: paginatedRankings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: rankings.length,
        totalPages: Math.ceil(rankings.length / limitNum)
      },
      period,
      filters: { university, country }
    });

  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return errorResponse(res, 'Failed to fetch leaderboard', 500);
  }
};

/**
 * Get current user's rankings for all periods
 */
const getMyRanking = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's points
    const userPoints = await getDoc(USER_POINTS, userId);
    const currentPoints = userPoints ? userPoints.points || 0 : 0;

    // Get rankings for all periods
    const periods = ['weekly', 'monthly', 'alltime'];
    const rankings = {};

    for (const period of periods) {
      let leaderboardEntries;
      
      if (period === 'alltime') {
        leaderboardEntries = await getCollection(LEADERBOARD, [
          ['period', '==', 'alltime']
        ]);
      } else {
        const now = new Date();
        let periodKey;
        
        if (period === 'weekly') {
          periodKey = 'weekly';
        } else {
          periodKey = 'monthly';
        }
        
        leaderboardEntries = await getCollection(LEADERBOARD, [
          ['period', '==', periodKey]
        ]);
      }

      // Sort by points and find user's rank
      leaderboardEntries.sort((a, b) => b.points - a.points);
      
      const userEntry = leaderboardEntries.find(entry => entry.userId === userId);
      let rank = null;
      let totalUsers = leaderboardEntries.length;

      if (userEntry) {
        // Calculate rank considering ties
        let currentRank = 1;
        let previousPoints = null;
        
        for (let i = 0; i < leaderboardEntries.length; i++) {
          const entry = leaderboardEntries[i];
          
          if (previousPoints !== null && entry.points < previousPoints) {
            currentRank = i + 1;
          }
          
          if (entry.userId === userId) {
            rank = currentRank;
            break;
          }
          
          previousPoints = entry.points;
        }
      }

      rankings[period] = {
        rank,
        points: userEntry ? userEntry.points : currentPoints,
        totalUsers,
        percentile: rank ? Math.round((1 - rank / totalUsers) * 100) : null
      };
    }

    return successResponse(res, {
      rankings,
      currentPoints,
      userId
    });

  } catch (error) {
    console.error('Error getting user ranking:', error);
    return errorResponse(res, 'Failed to fetch your ranking', 500);
  }
};

/**
 * Get user's points history
 */
const getPointsHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
      return errorResponse(res, 'Invalid pagination parameters', 400);
    }

    // Get user's points history
    const { getUserPointsHistory } = require('../services/points.service');
    const result = await getUserPointsHistory(userId, pageNum, limitNum);

    if (!result.success) {
      return errorResponse(res, result.error, 500);
    }

    return successResponse(res, result);

  } catch (error) {
    console.error('Error getting points history:', error);
    return errorResponse(res, 'Failed to fetch points history', 500);
  }
};

/**
 * Get user's badges
 */
const getUserBadges = async (req, res) => {
  try {
    const userId = req.user.id;

    const { getUserBadges } = require('../services/points.service');
    const result = await getUserBadges(userId);

    if (!result.success) {
      return errorResponse(res, result.error, 500);
    }

    return successResponse(res, result);

  } catch (error) {
    console.error('Error getting user badges:', error);
    return errorResponse(res, 'Failed to fetch user badges', 500);
  }
};

/**
 * Get available badges
 */
const getAvailableBadges = async (req, res) => {
  try {
    const { getAvailableBadges } = require('../services/points.service');
    const badges = getAvailableBadges();

    return successResponse(res, { badges });

  } catch (error) {
    console.error('Error getting available badges:', error);
    return errorResponse(res, 'Failed to fetch available badges', 500);
  }
};

/**
 * Get leaderboard statistics (admin only)
 */
const getLeaderboardStats = async (req, res) => {
  try {
    const { period = 'alltime' } = req.query;

    if (!['weekly', 'monthly', 'alltime'].includes(period)) {
      return errorResponse(res, 'Invalid period. Must be weekly, monthly, or alltime', 400);
    }

    // Get leaderboard entries
    let leaderboardEntries;
    if (period === 'alltime') {
      leaderboardEntries = await getCollection(LEADERBOARD, [
        ['period', '==', 'alltime']
      ]);
    } else {
      const now = new Date();
      let periodKey;
      
      if (period === 'weekly') {
        periodKey = 'weekly';
      } else {
        periodKey = 'monthly';
      }
      
      leaderboardEntries = await getCollection(LEADERBOARD, [
        ['period', '==', periodKey]
      ]);
    }

    // Calculate statistics
    const stats = {
      totalParticipants: leaderboardEntries.length,
      totalPoints: leaderboardEntries.reduce((sum, entry) => sum + entry.points, 0),
      averagePoints: leaderboardEntries.length > 0 ? 
        Math.round(leaderboardEntries.reduce((sum, entry) => sum + entry.points, 0) / leaderboardEntries.length) : 0,
      topScore: leaderboardEntries.length > 0 ? leaderboardEntries[0].points : 0,
      medianPoints: calculateMedian(leaderboardEntries.map(entry => entry.points)),
      distribution: calculateDistribution(leaderboardEntries.map(entry => entry.points))
    };

    return successResponse(res, { stats, period });

  } catch (error) {
    console.error('Error getting leaderboard stats:', error);
    return errorResponse(res, 'Failed to fetch leaderboard statistics', 500);
  }
};

/**
 * Get top performers by category
 */
const getTopPerformers = async (req, res) => {
  try {
    const { category = 'points', limit = 10 } = req.query;
    
    const limitNum = parseInt(limit);
    if (limitNum < 1 || limitNum > 50) {
      return errorResponse(res, 'Invalid limit parameter', 400);
    }

    let performers = [];

    switch (category) {
      case 'points':
        // Get top points earners
        const leaderboardEntries = await getCollection(LEADERBOARD, [
          ['period', '==', 'alltime']
        ]);
        
        leaderboardEntries.sort((a, b) => b.points - a.points);
        const topEntries = leaderboardEntries.slice(0, limitNum);
        
        const userIds = topEntries.map(entry => entry.userId);
        const users = await getCollection(USERS, [
          ['uid', 'in', userIds]
        ]);

        performers = topEntries.map((entry, index) => {
          const user = users.find(u => u.uid === entry.userId);
          return {
            rank: index + 1,
            userId: entry.userId,
            name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
            avatar: user?.avatar,
            score: entry.points,
            university: user?.university
          };
        });
        break;

      case 'badges':
        // Get users with most badges
        const allUserBadges = await getCollection(USER_BADGES, []);
        const badgeCounts = {};
        
        allUserBadges.forEach(badge => {
          badgeCounts[badge.userId] = (badgeCounts[badge.userId] || 0) + 1;
        });

        const sortedBadgeCounts = Object.entries(badgeCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, limitNum);

        const badgeUserIds = sortedBadgeCounts.map(([userId]) => userId);
        const badgeUsers = await getCollection(USERS, [
          ['uid', 'in', badgeUserIds]
        ]);

        performers = sortedBadgeCounts.map(([userId, count], index) => {
          const user = badgeUsers.find(u => u.uid === userId);
          return {
            rank: index + 1,
            userId,
            name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
            avatar: user?.avatar,
            score: count,
            university: user?.university
          };
        });
        break;

      default:
        return errorResponse(res, 'Invalid category. Must be points or badges', 400);
    }

    return successResponse(res, {
      category,
      performers,
      total: performers.length
    });

  } catch (error) {
    console.error('Error getting top performers:', error);
    return errorResponse(res, 'Failed to fetch top performers', 500);
  }
};

/**
 * Helper function to get user's top badge
 */
const getTopBadge = (badges) => {
  if (!badges || badges.length === 0) return null;
  
  // Sort by rarity and award date
  const rarityOrder = { 'legendary': 5, 'epic': 4, 'rare': 3, 'uncommon': 2, 'common': 1 };
  
  return badges
    .sort((a, b) => {
      const rarityDiff = (rarityOrder[b.badgeRarity] || 0) - (rarityOrder[a.badgeRarity] || 0);
      if (rarityDiff !== 0) return rarityDiff;
      
      // If same rarity, sort by award date (most recent first)
      return new Date(b.awardedAt) - new Date(a.awardedAt);
    })[0];
};

/**
 * Calculate median value
 */
const calculateMedian = (values) => {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
};

/**
 * Calculate distribution of points
 */
const calculateDistribution = (values) => {
  if (values.length === 0) return {};
  
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min;
  
  if (range === 0) {
    return { [min]: values.length };
  }
  
  const bins = 5;
  const binSize = range / bins;
  const distribution = {};
  
  for (let i = 0; i < bins; i++) {
    const binMin = min + (i * binSize);
    const binMax = i === bins - 1 ? max : min + ((i + 1) * binSize);
    const binKey = `${Math.round(binMin)}-${Math.round(binMax)}`;
    
    distribution[binKey] = values.filter(value => 
      value >= binMin && (i === bins - 1 ? value <= binMax : value < binMax)
    ).length;
  }
  
  return distribution;
};

/**
 * Get week start date
 */
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
};

/**
 * Get month start date
 */
const getMonthStart = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
};

module.exports = {
  getLeaderboard,
  getMyRanking,
  getPointsHistory,
  getUserBadges,
  getAvailableBadges,
  getLeaderboardStats,
  getTopPerformers
};
