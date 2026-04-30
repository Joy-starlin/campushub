const { db } = require('../config/firebase');
const { 
  getDoc, 
  getCollection, 
  createDoc, 
  updateDoc, 
  incrementField,
  paginatedQuery
} = require('../utils/db.helpers');
const { 
  CLUBS, 
  CLUB_MEMBERS, 
  CLUB_CHANNELS,
  CLUB_JOIN_REQUESTS,
  USERS,
  USER_POINTS,
  NOTIFICATIONS
} = require('../utils/collections');
const { 
  uploadClubLogo 
} = require('../services/upload.service');
const { 
  successResponse, 
  errorResponse, 
  createdResponse, 
  notFoundResponse 
} = require('../utils/response');

/**
 * Create a new club (admin only)
 */
const createClub = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      category, 
      rules, 
      university, 
      isPrivate 
    } = req.body;
    const userId = req.user.id;

    // Handle logo upload
    let logo = null;
    if (req.files && req.files.logo) {
      const uploadResult = await uploadClubLogo(req.files.logo[0], 'temp');
      if (!uploadResult.success) {
        return errorResponse(res, 'Failed to upload logo', 400);
      }
      logo = {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        width: uploadResult.width,
        height: uploadResult.height
      };
    }

    // Handle cover upload
    let cover = null;
    if (req.files && req.files.cover) {
      const uploadResult = await uploadClubLogo(req.files.cover[0], 'temp');
      if (!uploadResult.success) {
        return errorResponse(res, 'Failed to upload cover', 400);
      }
      cover = {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        width: uploadResult.width,
        height: uploadResult.height
      };
    }

    // Create club
    const clubData = {
      name: name.trim(),
      description: description.trim(),
      category,
      rules: rules || [],
      logo,
      cover,
      isPrivate: isPrivate || false,
      university: university || req.user.university,
      founder: userId,
      founderName: `${req.user.firstName} ${req.user.lastName}`,
      memberCount: 1,
      status: 'active',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const club = await createDoc(CLUBS, clubData);

    // Add founder as admin member
    await createDoc(CLUB_MEMBERS, {
      clubId: club.id,
      userId,
      role: 'admin',
      joinedAt: new Date().toISOString(),
      status: 'active'
    });

    // Create default channels
    const defaultChannels = [
      { name: 'general', description: 'General discussion', isReadOnly: false },
      { name: 'announcements', description: 'Club announcements', isReadOnly: true },
      { name: 'events', description: 'Event planning', isReadOnly: false },
      { name: 'resources', description: 'Resource sharing', isReadOnly: false }
    ];

    for (const channel of defaultChannels) {
      await createDoc(CLUB_CHANNELS, {
        clubId: club.id,
        name: channel.name,
        description: channel.description,
        isReadOnly: channel.isReadOnly,
        createdBy: userId,
        createdAt: new Date().toISOString()
      });
    }

    return createdResponse(res, { club }, 'Club created successfully');

  } catch (error) {
    console.error('Error creating club:', error);
    return errorResponse(res, 'Failed to create club', 500);
  }
};

/**
 * Get all clubs (public feed)
 */
const getAllClubs = async (req, res) => {
  try {
    const { 
      category, 
      university, 
      search, 
      page = 1, 
      limit = 20 
    } = req.query;

    const pageSize = Math.min(parseInt(limit), 50);
    const currentPage = Math.max(parseInt(page), 1);

    // Build filters
    const filters = [
      ['status', '==', 'active'],
      ['isDeleted', '==', false]
    ];

    if (category) {
      filters.push(['category', '==', category]);
    }

    if (university) {
      filters.push(['university', '==', university]);
    }

    // Get clubs
    const result = await paginatedQuery(CLUBS, filters, pageSize, null, {
      field: 'memberCount',
      direction: 'desc'
    });

    // Apply search filter if provided
    let clubs = result.data;
    if (search) {
      clubs = clubs.filter(club => {
        const searchLower = search.toLowerCase();
        return club.name.toLowerCase().includes(searchLower) ||
               club.description.toLowerCase().includes(searchLower);
      });
    }

    // Enrich clubs with user membership status
    const enrichedClubs = await Promise.all(
      clubs.map(async (club) => {
        const enrichedClub = { ...club };

        // Add membership status if user is logged in
        if (req.user) {
          const membership = await getCollection(CLUB_MEMBERS, [
            ['clubId', '==', club.id],
            ['userId', '==', req.user.id]
          ]);
          enrichedClub.userMembership = membership.length > 0 ? membership[0] : null;
        }

        return enrichedClub;
      })
    );

    return successResponse(res, {
      clubs: enrichedClubs,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total: result.totalCount,
        totalPages: Math.ceil(result.totalCount / pageSize),
        hasNextPage: result.hasMore,
        nextCursor: result.nextCursor
      }
    });

  } catch (error) {
    console.error('Error getting clubs:', error);
    return errorResponse(res, 'Failed to fetch clubs', 500);
  }
};

/**
 * Get single club by ID
 */
const getClubById = async (req, res) => {
  try {
    const { id } = req.params;

    const club = await getDoc(CLUBS, id);
    if (!club || club.isDeleted) {
      return notFoundResponse(res, 'Club not found');
    }

    // Add user membership status if logged in
    let userMembership = null;
    if (req.user) {
      const membership = await getCollection(CLUB_MEMBERS, [
        ['clubId', '==', id],
        ['userId', '==', req.user.id]
      ]);
      userMembership = membership.length > 0 ? membership[0] : null;
    }

    const enrichedClub = {
      ...club,
      userMembership
    };

    return successResponse(res, { club: enrichedClub });

  } catch (error) {
    console.error('Error getting club:', error);
    return errorResponse(res, 'Failed to fetch club', 500);
  }
};

/**
 * Join a club
 */
const joinClub = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const club = await getDoc(CLUBS, id);
    if (!club || club.isDeleted) {
      return notFoundResponse(res, 'Club not found');
    }

    // Check if already a member
    const existingMembership = await getCollection(CLUB_MEMBERS, [
      ['clubId', '==', id],
      ['userId', '==', userId]
    ]);

    if (existingMembership.length > 0) {
      return errorResponse(res, 'Already a member of this club', 409);
    }

    if (club.isPrivate) {
      // Create join request for private club
      const joinRequest = await createDoc(CLUB_JOIN_REQUESTS, {
        clubId: id,
        userId,
        status: 'pending',
        requestedAt: new Date().toISOString()
      });

      // TODO: Notify club admins
      console.log('Join request created for private club:', joinRequest.id);

      return successResponse(res, { 
        joinRequest 
      }, 'Join request submitted for approval');

    } else {
      // Add to club members for public club
      await createDoc(CLUB_MEMBERS, {
        clubId: id,
        userId,
        role: 'member',
        joinedAt: new Date().toISOString(),
        status: 'active'
      });

      // Increment member count
      await incrementField(CLUBS, id, 'memberCount', 1);

      // Award points
      await incrementField(USER_POINTS, userId, 'points', 5);

      // TODO: Notify club admins
      console.log('User joined public club:', id);

      return successResponse(res, null, 'Joined club successfully');
    }

  } catch (error) {
    console.error('Error joining club:', error);
    return errorResponse(res, 'Failed to join club', 500);
  }
};

/**
 * Leave a club
 */
const leaveClub = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const club = await getDoc(CLUBS, id);
    if (!club || club.isDeleted) {
      return notFoundResponse(res, 'Club not found');
    }

    // Find membership
    const membership = await getCollection(CLUB_MEMBERS, [
      ['clubId', '==', id],
      ['userId', '==', userId]
    ]);

    if (membership.length === 0) {
      return errorResponse(res, 'Not a member of this club', 404);
    }

    // Remove from club members
    await db.collection(CLUB_MEMBERS).doc(membership[0].id).delete();

    // Decrement member count
    await incrementField(CLUBS, id, 'memberCount', -1);

    return successResponse(res, null, 'Left club successfully');

  } catch (error) {
    console.error('Error leaving club:', error);
    return errorResponse(res, 'Failed to leave club', 500);
  }
};

/**
 * Get club members
 */
const getClubMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    const club = await getDoc(CLUBS, id);
    if (!club || club.isDeleted) {
      return notFoundResponse(res, 'Club not found');
    }

    // Check if user is a member
    const userMembership = await getCollection(CLUB_MEMBERS, [
      ['clubId', '==', id],
      ['userId', '==', userId]
    ]);

    if (userMembership.length === 0) {
      return errorResponse(res, 'Must be a member to view club members', 403);
    }

    const pageSize = Math.min(parseInt(limit), 50);
    const currentPage = Math.max(parseInt(page), 1);

    // Build filters
    const filters = [['clubId', '==', id]];
    if (role) {
      filters.push(['role', '==', role]);
    }

    // Get members
    const result = await paginatedQuery(CLUB_MEMBERS, filters, pageSize, null, {
      field: 'joinedAt',
      direction: 'desc'
    });

    // Enrich with user information
    const enrichedMembers = await Promise.all(
      result.data.map(async (member) => {
        const user = await getDoc(USERS, member.userId);
        return {
          ...member,
          userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          userAvatar: user?.profilePicture || null,
          userVerified: user?.verifiedStudent || false
        };
      })
    );

    return successResponse(res, {
      members: enrichedMembers,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total: result.totalCount,
        totalPages: Math.ceil(result.totalCount / pageSize),
        hasNextPage: result.hasMore,
        nextCursor: result.nextCursor
      }
    });

  } catch (error) {
    console.error('Error getting club members:', error);
    return errorResponse(res, 'Failed to fetch club members', 500);
  }
};

/**
 * Update member role
 */
const updateMemberRole = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;
    const currentUserId = req.user.id;

    const club = await getDoc(CLUBS, id);
    if (!club || club.isDeleted) {
      return notFoundResponse(res, 'Club not found');
    }

    // Check if current user is admin
    const currentUserMembership = await getCollection(CLUB_MEMBERS, [
      ['clubId', '==', id],
      ['userId', '==', currentUserId],
      ['role', '==', 'admin']
    ]);

    if (currentUserMembership.length === 0) {
      return errorResponse(res, 'Must be an admin to update member roles', 403);
    }

    if (!['admin', 'moderator', 'member'].includes(role)) {
      return errorResponse(res, 'Invalid role', 400);
    }

    // Find target member
    const targetMembership = await getCollection(CLUB_MEMBERS, [
      ['clubId', '==', id],
      ['userId', '==', userId]
    ]);

    if (targetMembership.length === 0) {
      return notFoundResponse(res, 'Member not found', 404);
    }

    // Update role
    await updateDoc(CLUB_MEMBERS, targetMembership[0].id, {
      role,
      roleUpdatedAt: new Date().toISOString(),
      roleUpdatedBy: currentUserId
    });

    return successResponse(res, null, 'Member role updated successfully');

  } catch (error) {
    console.error('Error updating member role:', error);
    return errorResponse(res, 'Failed to update member role', 500);
  }
};

/**
 * Approve join request
 */
const approveJoinRequest = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const currentUserId = req.user.id;

    const club = await getDoc(CLUBS, id);
    if (!club || club.isDeleted) {
      return notFoundResponse(res, 'Club not found');
    }

    // Check if current user is admin
    const currentUserMembership = await getCollection(CLUB_MEMBERS, [
      ['clubId', '==', id],
      ['userId', '==', currentUserId],
      ['role', '==', 'admin']
    ]);

    if (currentUserMembership.length === 0) {
      return errorResponse(res, 'Must be an admin to approve join requests', 403);
    }

    // Find join request
    const joinRequest = await getCollection(CLUB_JOIN_REQUESTS, [
      ['clubId', '==', id],
      ['userId', '==', userId],
      ['status', '==', 'pending']
    ]);

    if (joinRequest.length === 0) {
      return notFoundResponse(res, 'Join request not found', 404);
    }

    // Create club membership
    await createDoc(CLUB_MEMBERS, {
      clubId: id,
      userId,
      role: 'member',
      joinedAt: new Date().toISOString(),
      status: 'active'
    });

    // Update join request
    await updateDoc(CLUB_JOIN_REQUESTS, joinRequest[0].id, {
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: currentUserId
    });

    // Increment member count
    await incrementField(CLUBS, id, 'memberCount', 1);

    // Award points
    await incrementField(USER_POINTS, userId, 'points', 5);

    // TODO: Notify user of approval
    console.log('Join request approved for user:', userId);

    return successResponse(res, null, 'Join request approved');

  } catch (error) {
    console.error('Error approving join request:', error);
    return errorResponse(res, 'Failed to approve join request', 500);
  }
};

/**
 * Reject join request
 */
const rejectJoinRequest = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const currentUserId = req.user.id;

    const club = await getDoc(CLUBS, id);
    if (!club || club.isDeleted) {
      return notFoundResponse(res, 'Club not found');
    }

    // Check if current user is admin
    const currentUserMembership = await getCollection(CLUB_MEMBERS, [
      ['clubId', '==', id],
      ['userId', '==', currentUserId],
      ['role', '==', 'admin']
    ]);

    if (currentUserMembership.length === 0) {
      return errorResponse(res, 'Must be an admin to reject join requests', 403);
    }

    // Find join request
    const joinRequest = await getCollection(CLUB_JOIN_REQUESTS, [
      ['clubId', '==', id],
      ['userId', '==', userId],
      ['status', '==', 'pending']
    ]);

    if (joinRequest.length === 0) {
      return notFoundResponse(res, 'Join request not found', 404);
    }

    // Update join request
    await updateDoc(CLUB_JOIN_REQUESTS, joinRequest[0].id, {
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: currentUserId
    });

    // TODO: Notify user of rejection
    console.log('Join request rejected for user:', userId);

    return successResponse(res, null, 'Join request rejected');

  } catch (error) {
    console.error('Error rejecting join request:', error);
    return errorResponse(res, 'Failed to reject join request', 500);
  }
};

/**
 * Update a club
 */
const updateClub = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      category, 
      rules, 
      university, 
      isPrivate 
    } = req.body;
    const userId = req.user.id;

    const club = await getDoc(CLUBS, id);
    if (!club || club.isDeleted) {
      return notFoundResponse(res, 'Club not found');
    }

    // Check if user is admin
    const membership = await getCollection(CLUB_MEMBERS, [
      ['clubId', '==', id],
      ['userId', '==', userId],
      ['role', '==', 'admin']
    ]);

    if (membership.length === 0) {
      return errorResponse(res, 'Must be an admin to update club', 403);
    }

    // Update club
    await updateDoc(CLUBS, id, {
      name: name.trim(),
      description: description.trim(),
      category,
      rules: rules || [],
      university: university || req.user.university,
      isPrivate: isPrivate || false,
      updatedAt: new Date().toISOString()
    });

    return successResponse(res, null, 'Club updated successfully');

  } catch (error) {
    console.error('Error updating club:', error);
    return errorResponse(res, 'Failed to update club', 500);
  }
};

/**
 * Delete a club
 */
const deleteClub = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const club = await getDoc(CLUBS, id);
    if (!club || club.isDeleted) {
      return notFoundResponse(res, 'Club not found');
    }

    // Check if user is admin
    const membership = await getCollection(CLUB_MEMBERS, [
      ['clubId', '==', id],
      ['userId', '==', userId],
      ['role', '==', 'admin']
    ]);

    if (membership.length === 0) {
      return errorResponse(res, 'Must be an admin to delete club', 403);
    }

    // Delete club
    await updateDoc(CLUBS, id, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: userId
    });

    return successResponse(res, null, 'Club deleted successfully');

  } catch (error) {
    console.error('Error deleting club:', error);
    return errorResponse(res, 'Failed to delete club', 500);
  }
};

module.exports = {
  createClub,
  getAllClubs,
  getClubById,
  joinClub,
  leaveClub,
  getClubMembers,
  updateMemberRole,
  approveJoinRequest,
  rejectJoinRequest,
  updateClub,
  deleteClub
};
