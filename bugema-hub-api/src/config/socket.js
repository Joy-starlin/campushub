const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./firebase');
const { 
  getDoc, 
  getCollection, 
  updateDoc,
  createDoc 
} = require('../utils/db.helpers');
const { 
  CLUBS, 
  CLUB_MEMBERS, 
  ONLINE_USERS 
} = require('../utils/collections');

let io;
const connectedUsers = new Map(); // userId -> socketId mapping
const typingUsers = new Map(); // channelId -> Set of userIds typing

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Verify user exists in database
      const user = await getDoc('users', decoded.userId);
      if (!user || user.isDeleted) {
        return next(new Error('User not found'));
      }

      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      socket.userName = `${user.firstName} ${user.lastName}`;
      socket.userAvatar = user.profilePicture;
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} (${socket.userName}) connected`);
    
    // Track connected user
    connectedUsers.set(socket.userId, socket.id);
    
    // Set user as online in database
    updateOnlineStatus(socket.userId, true, socket);

    // Handle joining channels
    socket.on('join_channel', async (data) => {
      const { clubId, channelId } = data;
      
      try {
        // Verify user is member of club
        const membership = await getCollection(CLUB_MEMBERS, [
          ['clubId', '==', clubId],
          ['userId', '==', socket.userId]
        ]);

        if (membership.length === 0) {
          socket.emit('error', { message: 'Not a member of this club' });
          return;
        }

        const roomName = `club-${clubId}-channel-${channelId}`;
        socket.join(roomName);
        
        // Notify others that user is online in this channel
        socket.to(roomName).emit('user_online', {
          userId: socket.userId,
          userName: socket.userName,
          userAvatar: socket.userAvatar,
          channelId
        });
        
        // Send current online users in this channel
        const onlineUsersInChannel = await getOnlineUsersInChannel(channelId);
        socket.emit('online_users', {
          channelId,
          users: onlineUsersInChannel
        });
        
        console.log(`User ${socket.userId} joined ${roomName}`);
      } catch (error) {
        console.error('Error joining channel:', error);
        socket.emit('error', { message: 'Failed to join channel' });
      }
    });

    // Handle leaving channels
    socket.on('leave_channel', (data) => {
      const { clubId, channelId } = data;
      const roomName = `club-${clubId}-channel-${channelId}`;
      
      socket.leave(roomName);
      
      // Remove from typing users if they were typing
      if (typingUsers.has(channelId)) {
        typingUsers.get(channelId).delete(socket.userId);
        if (typingUsers.get(channelId).size === 0) {
          typingUsers.delete(channelId);
        }
      }
      
      // Notify others that user is offline in this channel
      socket.to(roomName).emit('user_offline', {
        userId: socket.userId,
        channelId
      });
      
      console.log(`User ${socket.userId} left ${roomName}`);
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { clubId, channelId } = data;
      const roomName = `club-${clubId}-channel-${channelId}`;
      
      // Add to typing users
      if (!typingUsers.has(channelId)) {
        typingUsers.set(channelId, new Set());
      }
      typingUsers.get(channelId).add(socket.userId);
      
      // Broadcast typing status
      socket.to(roomName).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userName,
        channelId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      const { clubId, channelId } = data;
      const roomName = `club-${clubId}-channel-${channelId}`;
      
      // Remove from typing users
      if (typingUsers.has(channelId)) {
        typingUsers.get(channelId).delete(socket.userId);
        if (typingUsers.get(channelId).size === 0) {
          typingUsers.delete(channelId);
        }
      }
      
      // Broadcast typing status
      socket.to(roomName).emit('user_typing', {
        userId: socket.userId,
        channelId,
        isTyping: false
      });
    });

    // Handle message read receipts
    socket.on('message_read', async (data) => {
      const { clubId, channelId, messageId } = data;
      const roomName = `club-${clubId}-channel-${channelId}`;
      
      try {
        // Update message read status in database
        // TODO: Implement message read tracking
        
        // Notify other users
        socket.to(roomName).emit('message_read_receipt', {
          userId: socket.userId,
          userName: socket.userName,
          messageId,
          readAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error handling message read:', error);
      }
    });

    // Handle direct messages (if implemented later)
    socket.on('direct_message', async (data) => {
      const { recipientId, content } = data;
      
      try {
        // TODO: Implement direct messaging
        console.log(`Direct message from ${socket.userId} to ${recipientId}`);
      } catch (error) {
        console.error('Error sending direct message:', error);
        socket.emit('error', { message: 'Failed to send direct message' });
      }
    });

    // Handle getting user status
    socket.on('get_user_status', async (data) => {
      const { userIds } = data;
      
      try {
        const statuses = {};
        for (const userId of userIds) {
          const isOnline = connectedUsers.has(userId);
          const onlineUser = await getOnlineUser(userId);
          statuses[userId] = {
            isOnline,
            lastSeen: onlineUser?.lastSeen || null,
            currentChannel: onlineUser?.currentChannel || null
          };
        }
        
        socket.emit('user_status', statuses);
      } catch (error) {
        console.error('Error getting user status:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User ${socket.userId} (${socket.userName}) disconnected`);
      
      // Remove from connected users
      connectedUsers.delete(socket.userId);
      
      // Set user as offline in database
      await updateOnlineStatus(socket.userId, false, socket);
      
      // Clean up typing indicators
      for (const [channelId, users] of typingUsers.entries()) {
        users.delete(socket.userId);
        if (users.size === 0) {
          typingUsers.delete(channelId);
        }
      }
      
      // Notify all channels user was in that they're offline
      socket.rooms.forEach(room => {
        if (room.startsWith('club-')) {
          socket.to(room).emit('user_offline', {
            userId: socket.userId
          });
        }
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  return io;
};

/**
 * Update user's online status in database
 */
const updateOnlineStatus = async (userId, isOnline, socket) => {
  try {
    const onlineData = {
      userId,
      isOnline,
      lastSeen: new Date().toISOString(),
      socketId: socket.id,
      userName: socket.userName,
      userAvatar: socket.userAvatar
    };

    const existingOnlineUser = await getCollection(ONLINE_USERS, [
      ['userId', '==', userId]
    ]);

    if (existingOnlineUser.length > 0) {
      await updateDoc(ONLINE_USERS, existingOnlineUser[0].id, onlineData);
    } else {
      await createDoc(ONLINE_USERS, onlineData);
    }
  } catch (error) {
    console.error('Error updating online status:', error);
  }
};

/**
 * Get online users in a specific channel
 */
const getOnlineUsersInChannel = async (channelId) => {
  try {
    const onlineUsers = await getCollection(ONLINE_USERS, [
      ['isOnline', '==', true],
      ['currentChannel', '==', channelId]
    ]);

    return onlineUsers.map(user => ({
      userId: user.userId,
      userName: user.userName,
      userAvatar: user.userAvatar,
      lastSeen: user.lastSeen
    }));
  } catch (error) {
    console.error('Error getting online users in channel:', error);
    return [];
  }
};

/**
 * Get online user by ID
 */
const getOnlineUser = async (userId) => {
  try {
    const users = await getCollection(ONLINE_USERS, [
      ['userId', '==', userId]
    ]);
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error getting online user:', error);
    return null;
  }
};

/**
 * Get Socket.io instance
 */
const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Get connected users count
 */
const getConnectedUsersCount = () => {
  return connectedUsers.size;
};

/**
 * Get typing users in channel
 */
const getTypingUsers = (channelId) => {
  return typingUsers.get(channelId) || new Set();
};

/**
 * Send notification to specific user
 */
const sendNotificationToUser = (userId, event, data) => {
  const socketId = connectedUsers.get(userId);
  if (socketId && io) {
    io.to(socketId).emit(event, data);
  }
};

/**
 * Send notification to club members
 */
const sendNotificationToClub = (clubId, event, data) => {
  if (io) {
    io.to(`club-${clubId}`).emit(event, data);
  }
};

/**
 * Send notification to channel
 */
const sendNotificationToChannel = (clubId, channelId, event, data) => {
  if (io) {
    io.to(`club-${clubId}-channel-${channelId}`).emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getIo,
  getConnectedUsersCount,
  getTypingUsers,
  sendNotificationToUser,
  sendNotificationToClub,
  sendNotificationToChannel,
  getOnlineUsersInChannel
};
