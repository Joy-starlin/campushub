const cron = require('node-cron');
const { 
  getDoc, 
  getCollection, 
  createDoc, 
  updateDoc,
  runTransaction
} = require('../utils/db.helpers');
const { 
  USERS, 
  USER_POINTS, 
  LEADERBOARD,
  NOTIFICATIONS 
} = require('../utils/collections');
const { getIO } = require('../config/socket');
const { emailService } = require('./email.service');
const { 
  createNotification,
  NOTIFICATION_TYPES 
} = require('./notification.service');

/**
 * Initialize all cron jobs
 */
const initializeCronJobs = () => {
  console.log('🕐 Initializing cron jobs...');

  // Weekly leaderboard calculation - Every Sunday at 11:55 PM
  cron.schedule('55 23 * * 0', async () => {
    console.log('📊 Running weekly leaderboard calculation...');
    await calculateWeeklyLeaderboard();
  }, {
    scheduled: true,
    timezone: 'Africa/Kampala'
  });

  // Monthly leaderboard calculation - Every 1st of month at 12:05 AM
  cron.schedule('5 0 1 * *', async () => {
    console.log('📊 Running monthly leaderboard calculation...');
    await calculateMonthlyLeaderboard();
  }, {
    scheduled: true,
    timezone: 'Africa/Kampala'
  });

  // Weekly digest email - Every Monday at 9:00 AM
  cron.schedule('0 9 * * 1', async () => {
    console.log('📧 Sending weekly digest emails...');
    await sendWeeklyDigest();
  }, {
    scheduled: true,
    timezone: 'Africa/Kampala'
  });

  // Daily login streak reset - Every day at 12:00 AM
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Resetting daily login streaks...');
    await resetDailyStreaks();
  }, {
    scheduled: true,
    timezone: 'Africa/Kampala'
  });

  // Cleanup old leaderboard data - Every 1st of month at 2:00 AM
  cron.schedule('0 2 1 * *', async () => {
    console.log('🧹 Cleaning up old leaderboard data...');
    await cleanupOldLeaderboardData();
  }, {
    scheduled: true,
    timezone: 'Africa/Kampala'
  });

  console.log('✅ Cron jobs initialized successfully');
};

/**
 * Calculate weekly leaderboard
 */
const calculateWeeklyLeaderboard = async () => {
  try {
    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    console.log(`📅 Calculating leaderboard for week: ${weekStart} to ${weekEnd}`);

    // Get all user points
    const allUserPoints = await getCollection(USER_POINTS, []);
    
    // Calculate weekly scores based on points history
    const weeklyScores = [];
    
    for (const userPoints of allUserPoints) {
      // Get points earned this week
      const weeklyPoints = await calculateWeeklyScore(userPoints.userId, weekStart, weekEnd);
      
      if (weeklyPoints > 0) {
        weeklyScores.push({
          userId: userPoints.userId,
          points: weeklyPoints,
          weekStart: weekStart.toISOString().split('T')[0]
        });
      }
    }

    // Sort by points (highest first)
    weeklyScores.sort((a, b) => b.points - a.points);

    // Update weekly leaderboard
    await updateWeeklyLeaderboard(weeklyScores, weekStart);

    // Send weekly ranking notifications
    await sendWeeklyRankingNotifications(weeklyScores);

    // Emit leaderboard update
    const io = getIO();
    io.emit('weekly_leaderboard_updated', {
      weekStart: weekStart.toISOString().split('T')[0],
      topUsers: weeklyScores.slice(0, 10)
    });

    console.log(`✅ Weekly leaderboard calculated for ${weeklyScores.length} users`);

  } catch (error) {
    console.error('❌ Error calculating weekly leaderboard:', error);
  }
};

/**
 * Calculate monthly leaderboard
 */
const calculateMonthlyLeaderboard = async () => {
  try {
    const now = new Date();
    const monthStart = getMonthStart(now);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    console.log(`📅 Calculating leaderboard for month: ${monthStart} to ${monthEnd}`);

    // Get all user points
    const allUserPoints = await getCollection(USER_POINTS, []);
    
    // Calculate monthly scores
    const monthlyScores = [];
    
    for (const userPoints of allUserPoints) {
      // Get points earned this month
      const monthlyPoints = await calculateMonthlyScore(userPoints.userId, monthStart, monthEnd);
      
      if (monthlyPoints > 0) {
        monthlyScores.push({
          userId: userPoints.userId,
          points: monthlyPoints,
          monthStart: monthStart.toISOString().split('T')[0]
        });
      }
    }

    // Sort by points (highest first)
    monthlyScores.sort((a, b) => b.points - a.points);

    // Update monthly leaderboard
    await updateMonthlyLeaderboard(monthlyScores, monthStart);

    // Send monthly ranking notifications
    await sendMonthlyRankingNotifications(monthlyScores);

    // Emit leaderboard update
    const io = getIO();
    io.emit('monthly_leaderboard_updated', {
      monthStart: monthStart.toISOString().split('T')[0],
      topUsers: monthlyScores.slice(0, 10)
    });

    console.log(`✅ Monthly leaderboard calculated for ${monthlyScores.length} users`);

  } catch (error) {
    console.error('❌ Error calculating monthly leaderboard:', error);
  }
};

/**
 * Calculate weekly score for a user
 */
const calculateWeeklyScore = async (userId, weekStart, weekEnd) => {
  try {
    // Get points history for the week
    const pointsHistory = await getCollection('points_history', [
      ['userId', '==', userId],
      ['createdAt', '>=', weekStart.toISOString()],
      ['createdAt', '<=', weekEnd.toISOString()]
    ]);

    // Sum up points earned during the week
    return pointsHistory.reduce((total, entry) => total + entry.points, 0);

  } catch (error) {
    console.error(`Error calculating weekly score for user ${userId}:`, error);
    return 0;
  }
};

/**
 * Calculate monthly score for a user
 */
const calculateMonthlyScore = async (userId, monthStart, monthEnd) => {
  try {
    // Get points history for the month
    const pointsHistory = await getCollection('points_history', [
      ['userId', '==', userId],
      ['createdAt', '>=', monthStart.toISOString()],
      ['createdAt', '<=', monthEnd.toISOString()]
    ]);

    // Sum up points earned during the month
    return pointsHistory.reduce((total, entry) => total + entry.points, 0);

  } catch (error) {
    console.error(`Error calculating monthly score for user ${userId}:`, error);
    return 0;
  }
};

/**
 * Update weekly leaderboard
 */
const updateWeeklyLeaderboard = async (weeklyScores, weekStart) => {
  try {
    await runTransaction(async (transaction) => {
      // Clear existing weekly entries for this week
      const existingWeekly = await getCollection(LEADERBOARD, [
        ['period', '==', 'weekly']
      ]);

      for (const entry of existingWeekly) {
        if (entry.weekStart === weekStart.toISOString().split('T')[0]) {
          transaction.delete(`${LEADERBOARD}/${entry.id}`);
        }
      }

      // Add new weekly entries
      for (const score of weeklyScores) {
        const entryId = `weekly_${score.userId}_${weekStart.toISOString().split('T')[0]}`;
        transaction.set(`${LEADERBOARD}/${entryId}`, {
          id: entryId,
          userId: score.userId,
          points: score.points,
          period: 'weekly',
          weekStart: score.weekStart,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });

  } catch (error) {
    console.error('Error updating weekly leaderboard:', error);
    throw error;
  }
};

/**
 * Update monthly leaderboard
 */
const updateMonthlyLeaderboard = async (monthlyScores, monthStart) => {
  try {
    await runTransaction(async (transaction) => {
      // Clear existing monthly entries for this month
      const existingMonthly = await getCollection(LEADERBOARD, [
        ['period', '==', 'monthly']
      ]);

      for (const entry of existingMonthly) {
        if (entry.monthStart === monthStart.toISOString().split('T')[0]) {
          transaction.delete(`${LEADERBOARD}/${entry.id}`);
        }
      }

      // Add new monthly entries
      for (const score of monthlyScores) {
        const entryId = `monthly_${score.userId}_${monthStart.toISOString().split('T')[0]}`;
        transaction.set(`${LEADERBOARD}/${entryId}`, {
          id: entryId,
          userId: score.userId,
          points: score.points,
          period: 'monthly',
          monthStart: score.monthStart,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });

  } catch (error) {
    console.error('Error updating monthly leaderboard:', error);
    throw error;
  }
};

/**
 * Send weekly ranking notifications
 */
const sendWeeklyRankingNotifications = async (weeklyScores) => {
  try {
    const top10 = weeklyScores.slice(0, 10);
    
    for (let i = 0; i < top10.length; i++) {
      const score = top10[i];
      const user = await getDoc(USERS, score.userId);
      
      if (!user) continue;

      const rank = i + 1;
      let message = `You ranked #${rank} this week with ${score.points} points! 🎉`;
      let title = 'Weekly Ranking';
      
      if (rank === 1) {
        message = `🏆 Congratulations! You're #1 this week with ${score.points} points!`;
        title = 'Weekly Champion!';
      } else if (rank <= 3) {
        message = `🥈 Great job! You ranked #${rank} this week with ${score.points} points!`;
        title = 'Top 3 Weekly!';
      }

      // Send notification
      await createNotification(score.userId, {
        type: NOTIFICATION_TYPES.LEADERBOARD_CHANGE,
        title,
        message,
        metadata: { 
          rank, 
          points: score.points, 
          period: 'weekly',
          weekStart: score.weekStart
        },
        urgency: rank <= 3 ? 'high' : 'normal'
      });

      // Send email for top performers
      if (rank <= 3) {
        await emailService.sendEmail({
          to: user.email,
          subject: title,
          template: 'notification',
          data: {
            userName: `${user.firstName} ${user.lastName}`,
            title,
            message: `${message} Keep up the great work!`,
            urgency: 'high'
          }
        });
      }
    }

    // Send rank summary to all active users
    await sendWeeklyRankSummary(weeklyScores);

  } catch (error) {
    console.error('Error sending weekly ranking notifications:', error);
  }
};

/**
 * Send monthly ranking notifications
 */
const sendMonthlyRankingNotifications = async (monthlyScores) => {
  try {
    const top10 = monthlyScores.slice(0, 10);
    
    for (let i = 0; i < top10.length; i++) {
      const score = top10[i];
      const user = await getDoc(USERS, score.userId);
      
      if (!user) continue;

      const rank = i + 1;
      let message = `You ranked #${rank} this month with ${score.points} points! 🎉`;
      let title = 'Monthly Ranking';
      
      if (rank === 1) {
        message = `🏆 Congratulations! You're #1 this month with ${score.points} points!`;
        title = 'Monthly Champion!';
      } else if (rank <= 3) {
        message = `🥈 Amazing! You ranked #${rank} this month with ${score.points} points!`;
        title = 'Top 3 Monthly!';
      }

      // Send notification
      await createNotification(score.userId, {
        type: NOTIFICATION_TYPES.LEADERBOARD_CHANGE,
        title,
        message,
        metadata: { 
          rank, 
          points: score.points, 
          period: 'monthly',
          monthStart: score.monthStart
        },
        urgency: rank <= 3 ? 'high' : 'normal'
      });

      // Send email for top performers
      if (rank <= 3) {
        await emailService.sendEmail({
          to: user.email,
          subject: title,
          template: 'notification',
          data: {
            userName: `${user.firstName} ${user.lastName}`,
            title,
            message: `${message} Your consistency is paying off!`,
            urgency: 'high'
          }
        });
      }
    }

  } catch (error) {
    console.error('Error sending monthly ranking notifications:', error);
  }
};

/**
 * Send weekly rank summary to all users
 */
const sendWeeklyRankSummary = async (weeklyScores) => {
  try {
    // Get all active users (logged in within last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeUsers = await getCollection(USERS, [
      ['lastLoginAt', '>=', sevenDaysAgo.toISOString()]
    ]);

    for (const user of activeUsers) {
      const userScore = weeklyScores.find(score => score.userId === user.uid);
      const rank = userScore ? weeklyScores.indexOf(userScore) + 1 : null;
      
      let message = 'Check out this week\'s leaderboard!';
      let title = 'Weekly Leaderboard Update';
      
      if (rank) {
        message = `Your rank this week: #${rank} with ${userScore.points} points`;
        title = 'Your Weekly Rank';
      }

      await createNotification(user.uid, {
        type: NOTIFICATION_TYPES.LEADERBOARD_CHANGE,
        title,
        message,
        metadata: { 
          rank, 
          points: userScore?.points || 0,
          period: 'weekly'
        },
        urgency: 'normal'
      });
    }

  } catch (error) {
    console.error('Error sending weekly rank summary:', error);
  }
};

/**
 * Send weekly digest emails
 */
const sendWeeklyDigest = async () => {
  try {
    const now = new Date();
    const weekStart = getWeekStart(now);
    
    // Get all active users
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeUsers = await getCollection(USERS, [
      ['lastLoginAt', '>=', sevenDaysAgo.toISOString()]
    ]);

    for (const user of activeUsers) {
      // Calculate user's weekly stats
      const stats = await calculateUserWeeklyStats(user.uid, weekStart);
      
      // Send weekly digest email
      await emailService.weeklyDigest(user, stats);
    }

    console.log(`📧 Sent weekly digest to ${activeUsers.length} users`);

  } catch (error) {
    console.error('Error sending weekly digest:', error);
  }
};

/**
 * Calculate user's weekly stats for digest
 */
const calculateUserWeeklyStats = async (userId, weekStart) => {
  try {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Get points history for the week
    const pointsHistory = await getCollection('points_history', [
      ['userId', '==', userId],
      ['createdAt', '>=', weekStart.toISOString()],
      ['createdAt', '<=', weekEnd.toISOString()]
    ]);

    // Get user's current rank
    const weeklyLeaderboard = await getCollection(LEADERBOARD, [
      ['period', '==', 'weekly']
    ]);
    
    weeklyLeaderboard.sort((a, b) => b.points - a.points);
    const userRank = weeklyLeaderboard.findIndex(entry => entry.userId === userId) + 1;

    // Get badges earned this week
    const userBadges = await getCollection('user_badges', [
      ['userId', '==', userId],
      ['awardedAt', '>=', weekStart.toISOString()],
      ['awardedAt', '<=', weekEnd.toISOString()]
    ]);

    // Get upcoming events
    const upcomingEvents = await getCollection('events', [
      ['date', '>', new Date().toISOString()]
    ]);
    upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      pointsEarned: pointsHistory.reduce((total, entry) => total + entry.points, 0),
      currentRank: userRank > 0 ? userRank : null,
      achievements: userBadges.map(badge => badge.badgeName),
      upcomingEvents: upcomingEvents.slice(0, 3).map(event => ({
        title: event.title,
        date: event.date
      }))
    };

  } catch (error) {
    console.error(`Error calculating weekly stats for user ${userId}:`, error);
    return {
      pointsEarned: 0,
      currentRank: null,
      achievements: [],
      upcomingEvents: []
    };
  }
};

/**
 * Reset daily login streaks
 */
const resetDailyStreaks = async () => {
  try {
    // Get all users who didn't log in yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const users = await getCollection(USERS, [
      ['lastLoginAt', '<', today.toISOString()]
    ]);

    for (const user of users) {
      await updateDoc(USERS, user.uid, {
        loginStreak: 0,
        lastLoginStreakReset: new Date().toISOString()
      });
    }

    console.log(`🔄 Reset login streaks for ${users.length} users`);

  } catch (error) {
    console.error('Error resetting daily streaks:', error);
  }
};

/**
 * Cleanup old leaderboard data
 */
const cleanupOldLeaderboardData = async () => {
  try {
    // Keep data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const oldLeaderboardEntries = await getCollection(LEADERBOARD, [
      ['createdAt', '<', sixMonthsAgo.toISOString()]
    ]);

    for (const entry of oldLeaderboardEntries) {
      if (entry.period !== 'alltime') {
        await updateDoc(LEADERBOARD, entry.id, {
          deleted: true,
          deletedAt: new Date().toISOString()
        });
      }
    }

    console.log(`🧹 Cleaned up ${oldLeaderboardEntries.length} old leaderboard entries`);

  } catch (error) {
    console.error('Error cleaning up old leaderboard data:', error);
  }
};

/**
 * Get week start date
 */
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

/**
 * Get month start date
 */
const getMonthStart = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

module.exports = {
  initializeCronJobs,
  calculateWeeklyLeaderboard,
  calculateMonthlyLeaderboard,
  sendWeeklyDigest,
  resetDailyStreaks,
  cleanupOldLeaderboardData
};
