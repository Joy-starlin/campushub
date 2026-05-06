const { db } = require('../config/firebase');
const { 
  getDoc, 
  getCollection, 
  createDoc, 
  updateDoc,
  paginatedQuery
} = require('../utils/db.helpers');
const { 
  CLUBS, 
  CLUB_MEMBERS, 
  CLUB_CHANNELS,
  CHAT_MESSAGES,
  MESSAGE_REACTIONS,
  USERS
} = require('../utils/collections');
const { 
  uploadChatAttachments 
} = require('../services/upload.service');
const { 
  successResponse, 
  errorResponse, 
  createdResponse, 
  notFoundResponse 
} = require('../utils/response');

// Allowed emoji reactions
const ALLOWED_EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '👏', '🤔', '😢', '😮', '👎'];

/**
 * Get club channels
 */
const getChannels = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify club exists
    const club = await getDoc(CLUBS, id);
    if (!club || club.isDeleted) {
      return notFoundResponse(res, 'Club not found');
    }

    // Check if user is a member
    const membership = await getCollection(CLUB_MEMBERS, [
      ['clubId', '==', id],
      ['userId', '==', userId]
    ]);

    if (membership.length === 0) {
      return errorResponse(res, 'Must be a member to view channels', 403);
    }

    // Get channels
    const channels = await getCollection(CLUB_CHANNELS, [
      ['clubId', '==', id]
    ]);

    // Sort by creation date
    channels.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return successResponse(res, { channels });

  } catch (error) {
    console.error('Error getting channels:', error);
    return errorResponse(res, 'Failed to fetch channels', 500);
  }
};

/**
 * Create club channel
 */
const createChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isReadOnly } = req.body;
    const userId = req.user.id;

    // Verify club exists
    const club = await getDoc(CLUBS, id);
    if (!club || club.isDeleted) {
      return notFoundResponse(res, 'Club not found');
    }

    // Check if user is admin or moderator
    const membership = await getCollection(CLUB_MEMBERS, [
      ['clubId', '==', id],
      ['userId', '==', userId]
    ]);

    if (membership.length === 0 || !['admin', 'moderator'].includes(membership[0].role)) {
      return errorResponse(res, 'Must be an admin or moderator to create channels', 403);
    }

    // Check if channel name already exists
    const existingChannel = await getCollection(CLUB_CHANNELS, [
      ['clubId', '==', id],
      ['name', '==', name.trim()]
    ]);

    if (existingChannel.length > 0) {
      return errorResponse(res, 'Channel name already exists', 409);
    }

    // Create channel
    const channelData = {
      clubId: id,
      name: name.trim(),
      description: description?.trim() || '',
      isReadOnly: isReadOnly || false,
      createdBy: userId,
      createdAt: new Date().toISOString()
    };

    const channel = await createDoc(CLUB_CHANNELS, channelData);

    return createdResponse(res, { channel }, 'Channel created successfully');

  } catch (error) {
    console.error('Error creating channel:', error);
    return errorResponse(res, 'Failed to create channel', 500);
  }
};

/**
 * Get channel messages
 */
const getMessages = async (req, res) => {
  try {
    const { id, channelId } = req.params;
    const { before, limit = 50 } = req.query;
    const userId = req.user.id;

    // Verify club exists
    const club = await getDoc(CLUBS, id);
    if (!club || club.isDeleted) {
      return notFoundResponse(res, 'Club not found');
    }

    // Check if user is a member
    const membership = await getCollection(CLUB_MEMBERS, [
      ['clubId', '==', id],
      ['userId', '==', userId]
    ]);

    if (membership.length === 0) {
      return errorResponse(res, 'Must be a member to view messages', 403);
    }

    // Verify channel exists
    const channel = await getDoc(CLUB_CHANNELS, channelId);
    if (!channel || channel.clubId !== id) {
      return notFoundResponse(res, 'Channel not found');
    }

    const messageLimit = Math.min(parseInt(limit), 100);

    // Build filters
    const filters = [
      ['clubId', '==', id],
      ['channelId', '==', channelId],
      ['isDeleted', '==', false]
    ];

    // Add cursor filter if provided
    let cursor = null;
    if (before) {
      cursor = before;
    }

    // Get messages (newest first)
    const result = await paginatedQuery(CHAT_MESSAGES, filters, messageLimit, cursor, {
      field: 'createdAt',
      direction: 'desc'
    });

    // Enrich messages with user information
    const enrichedMessages = await Promise.all(
      result.data.map(async (message) => {
        const user = await getDoc(USERS, message.userId);
        return {
          ...message,
          userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          userAvatar: user?.profilePicture || null,
          userVerified: user?.verifiedStudent || false
        };
      })
    );

    return successResponse(res, {
      messages: enrichedMessages.reverse(), // Reverse to show oldest first
      pagination: {
        limit: messageLimit,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor
      }
    });

  } catch (error) {
    console.error('Error getting messages:', error);
    return errorResponse(res, 'Failed to fetch messages', 500);
  }
};

/**
 * Send message to channel
 */
const sendMessage = async (req, res) => {
  try {
    const { id, channelId } = req.params;
    const { content, attachments, replyToId } = req.body;
    const userId = req.user.id;

    // Verify club exists
    const club = await getDoc(CLUBS, id);
    if (!club || club.isDeleted) {
      return notFoundResponse(res, 'Club not found');
    }

    // Check if user is a member
    const membership = await getCollection(CLUB_MEMBERS, [
      ['clubId', '==', id],
      ['userId', '==', userId]
    ]);

    if (membership.length === 0) {
      return errorResponse(res, 'Must be a member to send messages', 403);
    }

    // Verify channel exists
    const channel = await getDoc(CLUB_CHANNELS, channelId);
    if (!channel || channel.clubId !== id) {
      return notFoundResponse(res, 'Channel not found');
    }

    // Check if channel is read-only
    if (channel.isReadOnly) {
      return errorResponse(res, 'Cannot send messages to read-only channel', 403);
    }

    if (!content || content.trim().length === 0) {
      return errorResponse(res, 'Message content is required', 400);
    }

    // Handle attachments
    let uploadedAttachments = [];
    if (req.files && req.files.attachments) {
      const uploadResult = await uploadChatAttachments(req.files.attachments, `${id}/${channelId}`);
      if (!uploadResult.success) {
        return errorResponse(res, 'Failed to upload attachments', 400);
      }
      uploadedAttachments = uploadResult.files.map(file => ({
        url: file.url,
        publicId: file.publicId,
        type: file.resourceType,
        name: file.originalname,
        size: file.bytes
      }));
    }

    // Validate replyToId if provided
    if (replyToId) {
      const replyMessage = await getDoc(CHAT_MESSAGES, replyToId);
      if (!replyMessage || replyMessage.channelId !== channelId) {
        return errorResponse(res, 'Invalid reply message', 400);
      }
    }

    // Create message
    const messageData = {
      clubId: id,
      channelId,
      userId,
      content: content.trim(),
      attachments: uploadedAttachments,
      replyToId: replyToId || null,
      reactions: [],
      isEdited: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const message = await createDoc(CHAT_MESSAGES, messageData);

    // Get user info for broadcasting
    const user = await getDoc(USERS, userId);
    const enrichedMessage = {
      ...message,
      userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
      userAvatar: user?.profilePicture || null,
      userVerified: user?.verifiedStudent || false
    };

    // Emit message via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`club-${id}-channel-${channelId}`).emit('new_message', enrichedMessage);
    }

    return createdResponse(res, { message: enrichedMessage }, 'Message sent successfully');

  } catch (error) {
    console.error('Error sending message:', error);
    return errorResponse(res, 'Failed to send message', 500);
  }
};

/**
 * Delete message
 */
const deleteMessage = async (req, res) => {
  try {
    const { id, channelId, messageId } = req.params;
    const userId = req.user.id;

    // Verify club exists
    const club = await getDoc(CLUBS, id);
    if (!club || club.isDeleted) {
      return notFoundResponse(res, 'Club not found');
    }

    // Check if user is a member
    const membership = await getCollection(CLUB_MEMBERS, [
      ['clubId', '==', id],
      ['userId', '==', userId]
    ]);

    if (membership.length === 0) {
      return errorResponse(res, 'Must be a member to delete messages', 403);
    }

    // Get message
    const message = await getDoc(CHAT_MESSAGES, messageId);
    if (!message || message.channelId !== channelId) {
      return notFoundResponse(res, 'Message not found');
    }

    // Check permissions (author or admin)
    const isAuthor = message.userId === userId;
    const isAdmin = membership[0].role === 'admin';

    if (!isAuthor && !isAdmin) {
      return errorResponse(res, 'Can only delete your own messages', 403);
    }

    // Soft delete message
    await updateDoc(CHAT_MESSAGES, messageId, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: userId
    });

    // Emit deletion event via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`club-${id}-channel-${channelId}`).emit('message_deleted', {
        messageId,
        channelId,
        deletedBy: userId
      });
    }

    return successResponse(res, null, 'Message deleted successfully');

  } catch (error) {
    console.error('Error deleting message:', error);
    return errorResponse(res, 'Failed to delete message', 500);
  }
};

/**
 * Add reaction to message
 */
const addReaction = async (req, res) => {
  try {
    const { id, channelId, messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    // Verify club exists
    const club = await getDoc(CLUBS, id);
    if (!club || club.isDeleted) {
      return notFoundResponse(res, 'Club not found');
    }

    // Check if user is a member
    const membership = await getCollection(CLUB_MEMBERS, [
      ['clubId', '==', id],
      ['userId', '==', userId]
    ]);

    if (membership.length === 0) {
      return errorResponse(res, 'Must be a member to react to messages', 403);
    }

    // Validate emoji
    if (!ALLOWED_EMOJIS.includes(emoji)) {
      return errorResponse(res, 'Invalid emoji', 400);
    }

    // Get message
    const message = await getDoc(CHAT_MESSAGES, messageId);
    if (!message || message.channelId !== channelId) {
      return notFoundResponse(res, 'Message not found');
    }

    // Check if user already reacted with this emoji
    const existingReaction = await getCollection(MESSAGE_REACTIONS, [
      ['messageId', '==', messageId],
      ['userId', '==', userId],
      ['emoji', '==', emoji]
    ]);

    if (existingReaction.length > 0) {
      // Remove reaction
      await db.collection(MESSAGE_REACTIONS).doc(existingReaction[0].id).delete();
    } else {
      // Add reaction
      await createDoc(MESSAGE_REACTIONS, {
        messageId,
        userId,
        emoji,
        createdAt: new Date().toISOString()
      });
    }

    // Get updated reactions
    const reactions = await getCollection(MESSAGE_REACTIONS, [
      ['messageId', '==', messageId]
    ]);

    // Emit reaction update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`club-${id}-channel-${channelId}`).emit('message_reaction', {
        messageId,
        reactions
      });
    }

    return successResponse(res, { reactions }, 'Reaction updated');

  } catch (error) {
    console.error('Error adding reaction:', error);
    return errorResponse(res, 'Failed to add reaction', 500);
  }
};

/**
 * Pin message
 */
const pinMessage = async (req, res) => {
  try {
    const { id, channelId, messageId } = req.params;
    const userId = req.user.id;

    // Verify club exists
    const club = await getDoc(CLUBS, id);
    if (!club || club.isDeleted) {
      return notFoundResponse(res, 'Club not found');
    }

    // Check if user is admin or moderator
    const membership = await getCollection(CLUB_MEMBERS, [
      ['clubId', '==', id],
      ['userId', '==', userId]
    ]);

    if (membership.length === 0 || !['admin', 'moderator'].includes(membership[0].role)) {
      return errorResponse(res, 'Must be an admin or moderator to pin messages', 403);
    }

    // Get message
    const message = await getDoc(CHAT_MESSAGES, messageId);
    if (!message || message.channelId !== channelId) {
      return notFoundResponse(res, 'Message not found');
    }

    // Toggle pin status
    const isPinned = message.isPinned || false;
    await updateDoc(CHAT_MESSAGES, messageId, {
      isPinned: !isPinned,
      pinnedAt: !isPinned ? new Date().toISOString() : null,
      pinnedBy: !isPinned ? userId : null
    });

    // Emit pin update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`club-${id}-channel-${channelId}`).emit('message_pinned', {
        messageId,
        isPinned: !isPinned,
        pinnedBy: !isPinned ? userId : null
      });
    }

    return successResponse(res, { 
      isPinned: !isPinned 
    }, !isPinned ? 'Message pinned' : 'Message unpinned');

  } catch (error) {
    console.error('Error pinning message:', error);
    return errorResponse(res, 'Failed to pin message', 500);
  }
};

module.exports = {
  getChannels,
  createChannel,
  getMessages,
  sendMessage,
  deleteMessage,
  addReaction,
  pinMessage
};
