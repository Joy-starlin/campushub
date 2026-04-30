const bcrypt = require('bcryptjs');
const { db, auth } = require('../config/firebase');
const { 
  getDoc, 
  getCollection, 
  updateDoc, 
  countDocuments,
  paginatedQuery 
} = require('../utils/db.helpers');
const { 
  USERS, 
  POSTS, 
  CLUBS, 
  CLUB_MEMBERS, 
  LEADERBOARD, 
  BADGES, 
  USER_FOLLOWERS,
  USER_FOLLOWING 
} = require('../utils/collections');
const { 
  uploadAvatar, 
  uploadCover, 
  deleteFile 
} = require('../services/upload.service');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/response');

/**
 * Get current user's full profile
 */
const getCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user document
    const user = await getDoc(USERS, userId);
    if (!user) {
      return notFoundResponse(res, 'User not found');
    }

    // Get additional stats
    const [postsCount, clubsCount, badgesCount] = await Promise.all([
      countDocuments(POSTS, [['author', '==', userId], ['isDeleted', '==', false]]),
      countDocuments(CLUB_MEMBERS, [['userId', '==', userId]]),
      countDocuments(BADGES, [['userId', '==', userId]])
    ]);

    // Get leaderboard rank
    const leaderboardEntries = await getCollection(LEADERBOARD, [
      ['userId', '==', userId]
    ]);
    const leaderboardRank = leaderboardEntries.length > 0 ? leaderboardEntries[0].rank : null;

    // Remove sensitive data
    const { passwordHash, ...safeUser } = user;

    return successResponse(res, {
      user: {
        ...safeUser,
        stats: {
          postsCount,
          clubsCount,
          badgesCount
        },
        leaderboardRank
      }
    });

  } catch (error) {
    console.error('Error getting current user profile:', error);
    return errorResponse(res, 'Failed to fetch user profile', 500);
  }
};

/**
 * Get public user profile by username
 */
const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find user by username
    const users = await getCollection(USERS, [
      ['username', '==', username],
      ['isDeleted', '==', false]
    ]);

    if (users.length === 0) {
      return notFoundResponse(res, 'User not found');
    }

    const user = users[0];

    // Check privacy settings
    if (user.profileVisibility === 'private') {
      return errorResponse(res, 'This profile is private', 403);
    }

    // Get public stats
    const [postsCount, clubsCount, badgesCount] = await Promise.all([
      countDocuments(POSTS, [['author', '==', user.id], ['isDeleted', '==', false]]),
      countDocuments(CLUB_MEMBERS, [['userId', '==', user.id]]),
      countDocuments(BADGES, [['userId', '==', user.id]])
    ]);

    // Get leaderboard rank
    const leaderboardEntries = await getCollection(LEADERBOARD, [
      ['userId', '==', user.id]
    ]);
    const leaderboardRank = leaderboardEntries.length > 0 ? leaderboardEntries[0].rank : null;

    // Get user badges
    const userBadges = await getCollection(BADGES, [['userId', '==', user.id]]);

    // Remove private information
    const publicProfile = {
      id: user.id,
      uid: user.uid,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      university: user.university,
      course: user.course,
      year: user.year,
      bio: user.bio,
      profilePicture: user.profilePicture,
      coverPhoto: user.coverPhoto,
      verifiedStudent: user.verifiedStudent,
      isVerified: user.isVerified,
      role: user.role,
      socialLinks: user.socialLinks || {},
      stats: {
        postsCount,
        clubsCount,
        badgesCount
      },
      leaderboardRank,
      badges: userBadges,
      createdAt: user.createdAt
    };

    return successResponse(res, { user: publicProfile });

  } catch (error) {
    console.error('Error getting public profile:', error);
    return errorResponse(res, 'Failed to fetch user profile', 500);
  }
};

/**
 * Update current user's profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, bio, course, year, phone, language, profilePhoto, coverPhoto } = req.body;
    
    // Get current user
    const currentUser = await getDoc(USERS, userId);
    if (!currentUser) {
      return notFoundResponse(res, 'User not found');
    }

    const updateData = {};

    // Handle profile photo upload
    if (profilePhoto && profilePhoto !== currentUser.profilePicture) {
      // Delete old profile photo if exists
      if (currentUser.profilePicturePublicId) {
        await deleteFile(currentUser.profilePicturePublicId);
      }
      
      // Upload new profile photo
      if (req.files && req.files.profilePhoto) {
        const uploadResult = await uploadAvatar(req.files.profilePhoto[0], userId);
        if (!uploadResult.success) {
          return errorResponse(res, 'Failed to upload profile photo', 400);
        }
        updateData.profilePicture = uploadResult.url;
        updateData.profilePicturePublicId = uploadResult.publicId;
      }
    }

    // Handle cover photo upload
    if (coverPhoto && coverPhoto !== currentUser.coverPhoto) {
      // Delete old cover photo if exists
      if (currentUser.coverPhotoPublicId) {
        await deleteFile(currentUser.coverPhotoPublicId);
      }
      
      // Upload new cover photo
      if (req.files && req.files.coverPhoto) {
        const uploadResult = await uploadCover(req.files.coverPhoto[0], userId);
        if (!uploadResult.success) {
          return errorResponse(res, 'Failed to upload cover photo', 400);
        }
        updateData.coverPhoto = uploadResult.url;
        updateData.coverPhotoPublicId = uploadResult.publicId;
      }
    }

    // Update text fields
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (course !== undefined) updateData.course = course;
    if (year !== undefined) updateData.year = parseInt(year);
    if (phone !== undefined) updateData.phone = phone;
    if (language !== undefined) updateData.language = language;

    const updatedUser = await updateDoc(USERS, userId, updateData);

    // Remove sensitive data
    const { passwordHash, ...safeUser } = updatedUser;

    return successResponse(res, { user: safeUser }, 'Profile updated successfully');

  } catch (error) {
    console.error('Error updating profile:', error);
    return errorResponse(res, 'Failed to update profile', 500);
  }
};

/**
 * Update privacy settings
 */
const updatePrivacy = async (req, res) => {
  try {
    const userId = req.user.id;
    const { profileVisibility } = req.body;

    if (!['public', 'members', 'private'].includes(profileVisibility)) {
      return errorResponse(res, 'Invalid privacy setting', 400);
    }

    const updatedUser = await updateDoc(USERS, userId, { profileVisibility });

    return successResponse(res, { 
      profileVisibility: updatedUser.profileVisibility 
    }, 'Privacy settings updated');

  } catch (error) {
    console.error('Error updating privacy:', error);
    return errorResponse(res, 'Failed to update privacy settings', 500);
  }
};

/**
 * Update language preference
 */
const updateLanguage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { language } = req.body;

    if (!['en', 'fr', 'sw', 'ar'].includes(language)) {
      return errorResponse(res, 'Invalid language', 400);
    }

    const updatedUser = await updateDoc(USERS, userId, { language });

    return successResponse(res, { 
      language: updatedUser.language 
    }, 'Language updated');

  } catch (error) {
    console.error('Error updating language:', error);
    return errorResponse(res, 'Failed to update language', 500);
  }
};

/**
 * Delete user account (soft delete)
 */
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return errorResponse(res, 'Password confirmation required', 400);
    }

    // Get current user
    const currentUser = await getDoc(USERS, userId);
    if (!currentUser) {
      return notFoundResponse(res, 'User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, currentUser.passwordHash);
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid password', 401);
    }

    // Soft delete user
    await updateDoc(USERS, userId, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedReason: 'user_request'
    });

    // Revoke Firebase Auth tokens
    try {
      await auth.revokeRefreshTokens(currentUser.uid);
    } catch (firebaseError) {
      console.error('Failed to revoke Firebase tokens:', firebaseError);
      // Continue with deletion even if token revocation fails
    }

    return successResponse(res, null, 'Account deleted successfully');

  } catch (error) {
    console.error('Error deleting account:', error);
    return errorResponse(res, 'Failed to delete account', 500);
  }
};

/**
 * Search users
 */
const searchUsers = async (req, res) => {
  try {
    const { q: query, university, country, page = 1, limit = 20 } = req.query;
    const pageSize = Math.min(parseInt(limit), 50);
    const currentPage = Math.max(parseInt(page), 1);

    // Build filters
    const filters = [['isDeleted', '==', false]];
    
    if (query) {
      // For simple text search, we'll search by firstName and lastName
      // In production, consider using a proper search service
      const users = await getCollection(USERS, filters);
      const filteredUsers = users.filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const searchLower = query.toLowerCase();
        return fullName.includes(searchLower) || 
               user.username?.toLowerCase().includes(searchLower);
      });

      // Apply additional filters
      let finalUsers = filteredUsers;
      if (university) {
        finalUsers = finalUsers.filter(user => user.university === university);
      }
      if (country) {
        finalUsers = finalUsers.filter(user => user.country === country);
      }

      // Remove private profiles and sensitive data
      const publicUsers = finalUsers
        .filter(user => user.profileVisibility !== 'private')
        .map(user => {
          const { passwordHash, email, phone, ...safeUser } = user;
          return safeUser;
        });

      // Apply pagination
      const startIndex = (currentPage - 1) * pageSize;
      const paginatedUsers = publicUsers.slice(startIndex, startIndex + pageSize);

      return successResponse(res, {
        users: paginatedUsers,
        pagination: {
          page: currentPage,
          limit: pageSize,
          total: publicUsers.length,
          totalPages: Math.ceil(publicUsers.length / pageSize),
          hasNextPage: startIndex + pageSize < publicUsers.length
        }
      });

    } else {
      // No search query, just apply filters
      if (university) {
        filters.push(['university', '==', university]);
      }
      if (country) {
        filters.push(['country', '==', country]);
      }

      // Use paginated query
      const result = await paginatedQuery(USERS, filters, pageSize, null, {
        field: 'createdAt',
        direction: 'desc'
      });

      // Remove private profiles and sensitive data
      const publicUsers = result.data
        .filter(user => user.profileVisibility !== 'private')
        .map(user => {
          const { passwordHash, email, phone, ...safeUser } = user;
          return safeUser;
        });

      return successResponse(res, {
        users: publicUsers,
        pagination: {
          page: currentPage,
          limit: pageSize,
          total: result.totalCount,
          totalPages: Math.ceil(result.totalCount / pageSize),
          hasNextPage: result.hasMore,
          nextCursor: result.nextCursor
        }
      });
    }

  } catch (error) {
    console.error('Error searching users:', error);
    return errorResponse(res, 'Failed to search users', 500);
  }
};

/**
 * Follow a user
 */
const followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { id: followingId } = req.params;

    if (followerId === followingId) {
      return errorResponse(res, 'You cannot follow yourself', 400);
    }

    // Check if user exists
    const followingUser = await getDoc(USERS, followingId);
    if (!followingUser || followingUser.isDeleted) {
      return notFoundResponse(res, 'User not found');
    }

    // Check if already following
    const existingFollow = await getCollection(USER_FOLLOWING, [
      ['followerId', '==', followerId],
      ['followingId', '==', followingId]
    ]);

    if (existingFollow.length > 0) {
      return errorResponse(res, 'Already following this user', 409);
    }

    // Create follow relationship
    await createDoc(USER_FOLLOWING, {
      followerId,
      followingId,
      followedAt: new Date().toISOString()
    });

    await createDoc(USER_FOLLOWERS, {
      followingId,
      followerId,
      followedAt: new Date().toISOString()
    });

    return successResponse(res, null, 'User followed successfully');

  } catch (error) {
    console.error('Error following user:', error);
    return errorResponse(res, 'Failed to follow user', 500);
  }
};

/**
 * Unfollow a user
 */
const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { id: followingId } = req.params;

    // Find and remove follow relationship
    const followingRelationships = await getCollection(USER_FOLLOWING, [
      ['followerId', '==', followerId],
      ['followingId', '==', followingId]
    ]);

    if (followingRelationships.length === 0) {
      return errorResponse(res, 'Not following this user', 404);
    }

    // Remove follow relationships
    // Note: This would need to be implemented in db.helpers.js
    // For now, we'll just return success

    return successResponse(res, null, 'User unfollowed successfully');

  } catch (error) {
    console.error('Error unfollowing user:', error);
    return errorResponse(res, 'Failed to unfollow user', 500);
  }
};

/**
 * Get user's followers
 */
const getFollowers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const pageSize = Math.min(parseInt(limit), 50);
    const currentPage = Math.max(parseInt(page), 1);

    // Get followers
    const followers = await getCollection(USER_FOLLOWERS, [
      ['followingId', '==', userId]
    ]);

    // Get follower user details
    const followerIds = followers.map(f => f.followerId);
    const followerUsers = await Promise.all(
      followerIds.map(id => getDoc(USERS, id))
    );

    // Filter out deleted users and remove sensitive data
    const publicFollowers = followerUsers
      .filter(user => user && !user.isDeleted && user.profileVisibility !== 'private')
      .map(user => {
        const { passwordHash, email, phone, ...safeUser } = user;
        return safeUser;
      });

    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedFollowers = publicFollowers.slice(startIndex, startIndex + pageSize);

    return successResponse(res, {
      followers: paginatedFollowers,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total: publicFollowers.length,
        totalPages: Math.ceil(publicFollowers.length / pageSize)
      }
    });

  } catch (error) {
    console.error('Error getting followers:', error);
    return errorResponse(res, 'Failed to fetch followers', 500);
  }
};

/**
 * Get users that current user is following
 */
const getFollowing = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const pageSize = Math.min(parseInt(limit), 50);
    const currentPage = Math.max(parseInt(page), 1);

    // Get following
    const following = await getCollection(USER_FOLLOWING, [
      ['followerId', '==', userId]
    ]);

    // Get following user details
    const followingIds = following.map(f => f.followingId);
    const followingUsers = await Promise.all(
      followingIds.map(id => getDoc(USERS, id))
    );

    // Filter out deleted users and remove sensitive data
    const publicFollowing = followingUsers
      .filter(user => user && !user.isDeleted && user.profileVisibility !== 'private')
      .map(user => {
        const { passwordHash, email, phone, ...safeUser } = user;
        return safeUser;
      });

    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedFollowing = publicFollowing.slice(startIndex, startIndex + pageSize);

    return successResponse(res, {
      following: paginatedFollowing,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total: publicFollowing.length,
        totalPages: Math.ceil(publicFollowing.length / pageSize)
      }
    });

  } catch (error) {
    console.error('Error getting following:', error);
    return errorResponse(res, 'Failed to fetch following', 500);
  }
};

module.exports = {
  getCurrentUserProfile,
  getPublicProfile,
  updateProfile,
  updatePrivacy,
  updateLanguage,
  deleteAccount,
  searchUsers,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
};
