const { 
  getDoc, 
  getCollection, 
  createDoc, 
  updateDoc,
  incrementField,
  runTransaction
} = require('../utils/db.helpers');
const { 
  USERS, 
  USER_POINTS, 
  POINTS_HISTORY, 
  BADGES, 
  USER_BADGES,
  LEADERBOARD,
  NOTIFICATIONS 
} = require('../utils/collections');
const { getIO } = require('../config/socket');
const { emailService } = require('./email.service');
const { 
  createNotification,
  NOTIFICATION_TYPES 
} = require('./notification.service');

// Points configuration
const POINTS_CONFIG = {
  POST_PUBLISHED: 10,
  POST_GETS_10_LIKES: 5,
  ATTEND_EVENT: 15,
  JOIN_CLUB: 5,
  STUDY_GROUP_HELP: 8,
  MARKETPLACE_SOLD: 10,
  FOUND_LOST_ITEM: 20,
  STUDENT_VERIFIED: 25,
  REFER_NEW_MEMBER: 30,
  WEEKLY_STREAK: 20,
  FIRST_POST: 10,
  JOIN_5_CLUBS: 20,
  EVENT_RSVP: 5,
  COMMENT_ON_POST: 3,
  LIKE_POST: 2,
  DAILY_LOGIN: 2,
  WEEKLY_LOGIN_BONUS: 10,
  MONTHLY_LOGIN_BONUS: 25,
  CREATE_CLUB: 15,
  CREATE_EVENT: 12,
  COMPLETE_PROFILE: 8,
  UPLOAD_PROFILE_PICTURE: 5,
  VERIFIED_EMAIL: 5,
  VERIFIED_PHONE: 8,
  HELP_STUDENT: 15,
  RECEIVE_5_STARS: 10,
  REFER_FRIEND: 30,
  BIRTHDAY_BONUS: 50,
  ANNIVERSARY_BONUS: 100
};

// Badges definition
const BADGES_DEFINITION = {
  first_post: {
    id: 'first_post',
    name: 'First Post',
    description: 'Published your first post',
    condition: 'publish first post',
    points: 10,
    icon: 'pen',
    category: 'social',
    rarity: 'common'
  },
  social_butterfly: {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Joined 5 clubs',
    condition: 'join 5 clubs',
    points: 25,
    icon: 'butterfly',
    category: 'social',
    rarity: 'uncommon'
  },
  event_goer: {
    id: 'event_goer',
    name: 'Event Goer',
    description: 'Attended 10 events',
    condition: 'attend 10 events',
    points: 50,
    icon: 'calendar',
    category: 'events',
    rarity: 'rare'
  },
  marketplace_pro: {
    id: 'marketplace_pro',
    name: 'Marketplace Pro',
    description: 'Sold 5 items',
    condition: 'sell 5 items',
    points: 40,
    icon: 'shopping-bag',
    category: 'marketplace',
    rarity: 'uncommon'
  },
  good_samaritan: {
    id: 'good_samaritan',
    name: 'Good Samaritan',
    description: 'Returned a lost item',
    condition: 'return lost item',
    points: 60,
    icon: 'helping-hand',
    category: 'community',
    rarity: 'rare'
  },
  study_leader: {
    id: 'study_leader',
    name: 'Study Leader',
    description: 'Created study group with 10+ members',
    condition: 'create group with 10+ members',
    points: 40,
    icon: 'graduation-cap',
    category: 'academic',
    rarity: 'uncommon'
  },
  verified_scholar: {
    id: 'verified_scholar',
    name: 'Verified Scholar',
    description: 'Verified student ID',
    condition: 'verify student ID',
    points: 25,
    icon: 'award',
    category: 'achievement',
    rarity: 'common'
  },
  top_contributor: {
    id: 'top_contributor',
    name: 'Top Contributor',
    description: 'Reached top 10 in leaderboard',
    condition: 'reach top 10',
    points: 100,
    icon: 'trophy',
    category: 'achievement',
    rarity: 'legendary'
  },
  pioneer: {
    id: 'pioneer',
    name: 'Pioneer',
    description: 'One of first 100 members',
    condition: 'one of first 100 members',
    points: 75,
    icon: 'flag',
    category: 'achievement',
    rarity: 'epic'
  },
  helpful_friend: {
    id: 'helpful_friend',
    name: 'Helpful Friend',
    description: 'Helped 5 students',
    condition: 'help 5 students',
    points: 30,
    icon: 'hands-helping',
    category: 'community',
    rarity: 'uncommon'
  },
  consistent_attendee: {
    id: 'consistent_attendee',
    name: 'Consistent Attendee',
    description: 'Attended events for 4 consecutive weeks',
    condition: '4 week attendance streak',
    points: 35,
    icon: 'calendar-check',
    category: 'events',
    rarity: 'rare'
  },
  conversation_starter: {
    id: 'conversation_starter',
    name: 'Conversation Starter',
    description: 'Created 10 popular posts',
    condition: '10 posts with 10+ likes',
    points: 45,
    icon: 'comments',
    category: 'social',
    rarity: 'rare'
  },
  trusted_seller: {
    id: 'trusted_seller',
    name: 'Trusted Seller',
    description: 'Maintained 5-star rating on 10 sales',
    condition: '10 sales with 5-star rating',
    points: 55,
    icon: 'star',
    category: 'marketplace',
    rarity: 'epic'
  },
  early_bird: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Logged in before 8 AM for 7 days',
    condition: '7 early morning logins',
    points: 20,
    icon: 'sun',
    category: 'engagement',
    rarity: 'uncommon'
  },
  night_owl: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Logged in after 10 PM for 7 days',
    condition: '7 late night logins',
    points: 20,
    icon: 'moon',
    category: 'engagement',
    rarity: 'uncommon'
  },
  community_builder: {
    id: 'community_builder',
    name: 'Community Builder',
    description: 'Referred 5 new members',
    condition: 'refer 5 members',
    points: 80,
    icon: 'users',
    category: 'community',
    rarity: 'epic'
  }
};

/**
 * Award points to a user
 */
const awardPoints = async (userId, action, metadata = {}) => {
  try {
    const points = POINTS_CONFIG[action];
    if (!points) {
      throw new Error(`Invalid action: ${action}`);
    }

    // Get user info for notification
    const user = await getDoc(USERS, userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Run transaction to award points
    await runTransaction(async (transaction) => {
      // Get current user points
      const userPointsRef = transaction.doc(`${USER_POINTS}/${userId}`);
      const userPointsDoc = await transaction.get(userPointsRef);
      
      let currentPoints = 0;
      if (userPointsDoc.exists) {
        currentPoints = userPointsDoc.data().points || 0;
      }

      // Update user points
      const newPoints = currentPoints + points;
      transaction.set(userPointsRef, {
        userId,
        points: newPoints,
        totalPointsEarned: incrementField(USER_POINTS, userId, 'totalPointsEarned', points),
        lastUpdated: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Create points history entry
      const historyId = require('uuid').v4();
      transaction.set(`${POINTS_HISTORY}/${historyId}`, {
        id: historyId,
        userId,
        action,
        points,
        metadata: metadata || {},
        previousPoints: currentPoints,
        newPoints,
        createdAt: new Date().toISOString()
      });

      // Update leaderboard
      await updateLeaderboardInTransaction(transaction, userId, newPoints);
    });

    // Check for badge eligibility
    await checkBadgeEligibility(userId, action, metadata);

    // Send notification
    await createNotification(userId, {
      type: NOTIFICATION_TYPES.BADGE_EARNED,
      title: 'Points Earned!',
      message: `You earned ${points} points for ${formatActionName(action)}!`,
      metadata: { action, points, metadata },
      urgency: 'normal'
    });

    // Emit leaderboard update
    const io = getIO();
    io.emit('leaderboard_update', {
      userId,
      points,
      action
    });

    return {
      success: true,
      points,
      message: `Awarded ${points} points for ${action}`
    };

  } catch (error) {
    console.error('Failed to award points:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Award badge to a user
 */
const awardBadge = async (userId, badgeId) => {
  try {
    const badge = BADGES_DEFINITION[badgeId];
    if (!badge) {
      throw new Error(`Invalid badge: ${badgeId}`);
    }

    const user = await getDoc(USERS, userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user already has this badge
    const existingUserBadge = await getCollection(USER_BADGES, [
      ['userId', '==', userId],
      ['badgeId', '==', badgeId]
    ]);

    if (existingUserBadge.length > 0) {
      return {
        success: true,
        message: 'User already has this badge'
      };
    }

    // Run transaction to award badge
    await runTransaction(async (transaction) => {
      // Add badge to user's collection
      const userBadgeId = require('uuid').v4();
      transaction.set(`${USER_BADGES}/${userBadgeId}`, {
        id: userBadgeId,
        userId,
        badgeId,
        badgeName: badge.name,
        badgeDescription: badge.description,
        badgeIcon: badge.icon,
        badgeCategory: badge.category,
        badgeRarity: badge.rarity,
        points: badge.points,
        awardedAt: new Date().toISOString(),
        metadata: {}
      });

      // Update user's badges array
      const userRef = transaction.doc(`${USERS}/${userId}`);
      const userDoc = await transaction.get(userRef);
      const userData = userDoc.data();
      const badges = userData.badges || [];
      
      transaction.update(userRef, {
        badges: [...badges, badgeId],
        updatedAt: new Date().toISOString()
      });

      // Award badge bonus points
      if (badge.points > 0) {
        const userPointsRef = transaction.doc(`${USER_POINTS}/${userId}`);
        const userPointsDoc = await transaction.get(userPointsRef);
        const currentPoints = userPointsDoc.exists ? userPointsDoc.data().points || 0 : 0;
        const newPoints = currentPoints + badge.points;
        
        transaction.set(userPointsRef, {
          userId,
          points: newPoints,
          lastUpdated: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });

        // Create points history for badge bonus
        const historyId = require('uuid').v4();
        transaction.set(`${POINTS_HISTORY}/${historyId}`, {
          id: historyId,
          userId,
          action: 'badge_bonus',
          points: badge.points,
          metadata: { badgeId, badgeName: badge.name },
          previousPoints: currentPoints,
          newPoints,
          createdAt: new Date().toISOString()
        });
      }
    });

    // Send notification
    await createNotification(userId, {
      type: NOTIFICATION_TYPES.BADGE_EARNED,
      title: '🏆 Badge Earned!',
      message: `Congratulations! You earned the "${badge.name}" badge!`,
      metadata: { badgeId, badgeName: badge.name, points: badge.points },
      urgency: 'high'
    });

    // Send badge earned email
    await emailService.badgeEarned(user, {
      ...badge,
      totalBadges: (user.badges?.length || 0) + 1,
      currentPoints: await getUserPoints(userId)
    });

    // Emit badge update
    const io = getIO();
    io.emit('badge_earned', {
      userId,
      badge,
      userName: `${user.firstName} ${user.lastName}`
    });

    return {
      success: true,
      badge,
      message: `Awarded ${badge.name} badge`
    };

  } catch (error) {
    console.error('Failed to award badge:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check if user is eligible for any badges based on action
 */
const checkBadgeEligibility = async (userId, action, metadata = {}) => {
  try {
    const user = await getDoc(USERS, userId);
    if (!user) return;

    const userBadges = await getCollection(USER_BADGES, [
      ['userId', '==', userId]
    ]);
    const earnedBadgeIds = userBadges.map(ub => ub.badgeId);

    // Check specific badge conditions based on action
    switch (action) {
      case 'POST_PUBLISHED':
        await checkFirstPostBadge(userId, earnedBadgeIds);
        await checkConversationStarterBadge(userId, earnedBadgeIds);
        break;
      
      case 'JOIN_CLUB':
        await checkSocialButterflyBadge(userId, earnedBadgeIds);
        await checkCommunityBuilderBadge(userId, earnedBadgeIds);
        break;
      
      case 'ATTEND_EVENT':
        await checkEventGoerBadge(userId, earnedBadgeIds);
        await checkConsistentAttendeeBadge(userId, earnedBadgeIds);
        break;
      
      case 'MARKETPLACE_SOLD':
        await checkMarketplaceProBadge(userId, earnedBadgeIds);
        await checkTrustedSellerBadge(userId, earnedBadgeIds);
        break;
      
      case 'FOUND_LOST_ITEM':
        await checkGoodSamaritanBadge(userId, earnedBadgeIds);
        break;
      
      case 'STUDENT_VERIFIED':
        await checkVerifiedScholarBadge(userId, earnedBadgeIds);
        break;
      
      case 'REFER_NEW_MEMBER':
        await checkCommunityBuilderBadge(userId, earnedBadgeIds);
        break;
      
      case 'STUDY_GROUP_HELP':
        await checkStudyLeaderBadge(userId, earnedBadgeIds);
        await checkHelpfulFriendBadge(userId, earnedBadgeIds);
        break;
      
      case 'DAILY_LOGIN':
        await checkEarlyBirdBadge(userId, earnedBadgeIds);
        await checkNightOwlBadge(userId, earnedBadgeIds);
        break;
    }

    // Check leaderboard-based badges
    await checkTopContributorBadge(userId, earnedBadgeIds);

    // Check pioneer badge (one-time check for early users)
    await checkPioneerBadge(userId, earnedBadgeIds);

  } catch (error) {
    console.error('Error checking badge eligibility:', error);
  }
};

/**
 * Check specific badge conditions
 */
const checkFirstPostBadge = async (userId, earnedBadgeIds) => {
  if (earnedBadgeIds.includes('first_post')) return;

  const posts = await getCollection('posts', [
    ['author', '==', userId]
  ]);

  if (posts.length >= 1) {
    await awardBadge(userId, 'first_post');
  }
};

const checkSocialButterflyBadge = async (userId, earnedBadgeIds) => {
  if (earnedBadgeIds.includes('social_butterfly')) return;

  const clubMemberships = await getCollection('club_members', [
    ['userId', '==', userId],
    ['status', '==', 'active']
  ]);

  if (clubMemberships.length >= 5) {
    await awardBadge(userId, 'social_butterfly');
  }
};

const checkEventGoerBadge = async (userId, earnedBadgeIds) => {
  if (earnedBadgeIds.includes('event_goer')) return;

  const eventAttendees = await getCollection('event_attendees', [
    ['userId', '==', userId],
    ['status', '==', 'attended']
  ]);

  if (eventAttendees.length >= 10) {
    await awardBadge(userId, 'event_goer');
  }
};

const checkMarketplaceProBadge = async (userId, earnedBadgeIds) => {
  if (earnedBadgeIds.includes('marketplace_pro')) return;

  const marketplaceItems = await getCollection('marketplace', [
    ['seller', '==', userId],
    ['status', '==', 'sold']
  ]);

  if (marketplaceItems.length >= 5) {
    await awardBadge(userId, 'marketplace_pro');
  }
};

const checkGoodSamaritanBadge = async (userId, earnedBadgeIds) => {
  if (earnedBadgeIds.includes('good_samaritan')) return;

  // This would be checked when a lost item is marked as found/returned
  // Implementation depends on the lost & found system
};

const checkVerifiedScholarBadge = async (userId, earnedBadgeIds) => {
  if (earnedBadgeIds.includes('verified_scholar')) return;

  const user = await getDoc(USERS, userId);
  if (user && user.verifiedStudent) {
    await awardBadge(userId, 'verified_scholar');
  }
};

const checkStudyLeaderBadge = async (userId, earnedBadgeIds) => {
  if (earnedBadgeIds.includes('study_leader')) return;

  const studyGroups = await getCollection('study_groups', [
    ['creator', '==', userId]
  ]);

  for (const group of studyGroups) {
    const members = await getCollection('study_group_members', [
      ['groupId', '==', group.id],
      ['status', '==', 'active']
    ]);

    if (members.length >= 10) {
      await awardBadge(userId, 'study_leader');
      break;
    }
  }
};

const checkTopContributorBadge = async (userId, earnedBadgeIds) => {
  if (earnedBadgeIds.includes('top_contributor')) return;

  const leaderboard = await getCollection(LEADERBOARD, [
    ['period', '==', 'alltime']
  ]);

  const top10 = leaderboard
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);

  const userRank = top10.findIndex(entry => entry.userId === userId);
  if (userRank !== -1) {
    await awardBadge(userId, 'top_contributor');
  }
};

const checkPioneerBadge = async (userId, earnedBadgeIds) => {
  if (earnedBadgeIds.includes('pioneer')) return;

  const user = await getDoc(USERS, userId);
  if (user) {
    const userIndex = parseInt(user.uid.substring(0, 8), 16); // Simple approximation
    if (userIndex < 100) {
      await awardBadge(userId, 'pioneer');
    }
  }
};

const checkHelpfulFriendBadge = async (userId, earnedBadgeIds) => {
  if (earnedBadgeIds.includes('helpful_friend')) return;

  // This would be tracked when users help others
  // Implementation depends on the help tracking system
};

const checkConsistentAttendeeBadge = async (userId, earnedBadgeIds) => {
  if (earnedBadgeIds.includes('consistent_attendee')) return;

  // Check for 4 consecutive weeks of event attendance
  // Complex logic requiring date calculations
};

const checkConversationStarterBadge = async (userId, earnedBadgeIds) => {
  if (earnedBadgeIds.includes('conversation_starter')) return;

  const posts = await getCollection('posts', [
    ['author', '==', userId]
  ]);

  const popularPosts = posts.filter(post => (post.likes || 0) >= 10);
  if (popularPosts.length >= 10) {
    await awardBadge(userId, 'conversation_starter');
  }
};

const checkTrustedSellerBadge = async (userId, earnedBadgeIds) => {
  if (earnedBadgeIds.includes('trusted_seller')) return;

  // Check for 10 sales with 5-star rating
  // Implementation depends on rating system
};

const checkEarlyBirdBadge = async (userId, earnedBadgeIds) => {
  if (earnedBadgeIds.includes('early_bird')) return;

  // Check for 7 early morning logins
  // Implementation depends on login tracking
};

const checkNightOwlBadge = async (userId, earnedBadgeIds) => {
  if (earnedBadgeIds.includes('night_owl')) return;

  // Check for 7 late night logins
  // Implementation depends on login tracking
};

const checkCommunityBuilderBadge = async (userId, earnedBadgeIds) => {
  if (earnedBadgeIds.includes('community_builder')) return;

  const referrals = await getCollection('users', [
    ['referredBy', '==', userId]
  ]);

  if (referrals.length >= 5) {
    await awardBadge(userId, 'community_builder');
  }
};

/**
 * Update leaderboard in transaction
 */
const updateLeaderboardInTransaction = async (transaction, userId, points) => {
  // Update all-time leaderboard
  const alltimeRef = transaction.doc(`${LEADERBOARD}/alltime_${userId}`);
  const alltimeDoc = await transaction.get(alltimeRef);
  
  if (alltimeDoc.exists) {
    transaction.update(alltimeRef, {
      userId,
      points,
      updatedAt: new Date().toISOString()
    });
  } else {
    transaction.set(alltimeRef, {
      userId,
      points,
      period: 'alltime',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // Update weekly leaderboard
  const weekStart = getWeekStart(new Date());
  const weeklyRef = transaction.doc(`${LEADERBOARD}/weekly_${userId}_${weekStart}`);
  const weeklyDoc = await transaction.get(weeklyRef);
  
  if (weeklyDoc.exists) {
    transaction.update(weeklyRef, {
      userId,
      points,
      updatedAt: new Date().toISOString()
    });
  } else {
    transaction.set(weeklyRef, {
      userId,
      points,
      period: 'weekly',
      weekStart,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // Update monthly leaderboard
  const monthStart = getMonthStart(new Date());
  const monthlyRef = transaction.doc(`${LEADERBOARD}/monthly_${userId}_${monthStart}`);
  const monthlyDoc = await transaction.get(monthlyRef);
  
  if (monthlyDoc.exists) {
    transaction.update(monthlyRef, {
      userId,
      points,
      updatedAt: new Date().toISOString()
    });
  } else {
    transaction.set(monthlyRef, {
      userId,
      points,
      period: 'monthly',
      monthStart,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
};

/**
 * Get user's current points
 */
const getUserPoints = async (userId) => {
  try {
    const userPoints = await getDoc(USER_POINTS, userId);
    return userPoints ? userPoints.points || 0 : 0;
  } catch (error) {
    console.error('Error getting user points:', error);
    return 0;
  }
};

/**
 * Get user's points history
 */
const getUserPointsHistory = async (userId, page = 1, limit = 20) => {
  try {
    const history = await getCollection(POINTS_HISTORY, [
      ['userId', '==', userId]
    ]);

    // Sort by date (newest first)
    history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedHistory = history.slice(startIndex, endIndex);

    return {
      success: true,
      history: paginatedHistory,
      pagination: {
        page,
        limit,
        total: history.length,
        totalPages: Math.ceil(history.length / limit)
      }
    };
  } catch (error) {
    console.error('Error getting points history:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get user's badges
 */
const getUserBadges = async (userId) => {
  try {
    const userBadges = await getCollection(USER_BADGES, [
      ['userId', '==', userId]
    ]);

    // Sort by awarded date (newest first)
    userBadges.sort((a, b) => new Date(b.awardedAt) - new Date(a.awardedAt));

    return {
      success: true,
      badges: userBadges
    };
  } catch (error) {
    console.error('Error getting user badges:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get available badges
 */
const getAvailableBadges = () => {
  return Object.values(BADGES_DEFINITION);
};

/**
 * Format action name for display
 */
const formatActionName = (action) => {
  return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
  awardPoints,
  awardBadge,
  checkBadgeEligibility,
  getUserPoints,
  getUserPointsHistory,
  getUserBadges,
  getAvailableBadges,
  POINTS_CONFIG,
  BADGES_DEFINITION
};
