const { 
  getDoc, 
  getCollection, 
  createDoc, 
  updateDoc,
  batchWrite
} = require('../utils/db.helpers');
const { 
  USERS, 
  NOTIFICATIONS 
} = require('../utils/collections');
const { getIO } = require('../config/socket');
const { emailService } = require('./email.service');
const { smsService } = require('./sms.service');
const webPush = require('web-push');

// Configure Web Push (only if VAPID keys are available)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@bugemahub.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Notification types
const NOTIFICATION_TYPES = {
  NEW_EVENT: 'new_event',
  POST_LIKED: 'post_liked',
  POST_COMMENTED: 'post_commented',
  CLUB_APPROVED: 'club_approved',
  PAYMENT_CONFIRMED: 'payment_confirmed',
  BADGE_EARNED: 'badge_earned',
  NEW_MESSAGE: 'new_message',
  LEADERBOARD_CHANGE: 'leaderboard_change',
  MARKETPLACE_MESSAGE: 'marketplace_message',
  ANNOUNCEMENT: 'announcement'
};

/**
 * Create and send notification to a single user
 */
const createNotification = async (userId, data) => {
  try {
    const { type, title, message, link, metadata, urgency = 'normal' } = data;

    // Validate notification type
    if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
      throw new Error('Invalid notification type');
    }

    // Get user preferences
    const user = await getDoc(USERS, userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check Do Not Disturb
    if (user.notificationSettings?.doNotDisturb?.enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [fromHours, fromMinutes] = user.notificationSettings.doNotDisturb.from.split(':').map(Number);
      const [toHours, toMinutes] = user.notificationSettings.doNotDisturb.to.split(':').map(Number);
      const fromTime = fromHours * 60 + fromMinutes;
      const toTime = toHours * 60 + toMinutes;

      if (currentTime >= fromTime || currentTime <= toTime) {
        if (urgency !== 'high') {
          return { success: true, skipped: true, reason: 'Do Not Disturb' };
        }
      }
    }

    // Create notification document
    const notification = await createDoc(NOTIFICATIONS, {
      userId,
      type,
      title,
      message,
      link,
      metadata: metadata || {},
      urgency,
      read: false,
      createdAt: new Date().toISOString()
    });

    // Emit via Socket.io to user's personal room
    const io = getIO();
    io.to(`user-${userId}`).emit('notification', notification);

    // Send push notification if enabled
    if (user.pushSubscription && user.notificationSettings?.push?.[type]) {
      try {
        await sendPushNotification(user.pushSubscription, {
          title,
          message,
          icon: '/logo.png',
          badge: '/badge.png',
          tag: notification.id,
          data: { link, notificationId: notification.id }
        });
      } catch (pushError) {
        console.error('Push notification failed:', pushError);
      }
    }

    // Send email for announcements or high urgency
    if ((type === NOTIFICATION_TYPES.ANNOUNCEMENT || urgency === 'high') && 
        user.notificationSettings?.email?.[type] && 
        user.email) {
      try {
        await emailService.sendEmail({
          to: user.email,
          subject: title,
          template: 'notification',
          data: {
            userName: `${user.firstName} ${user.lastName}`,
            title,
            message,
            link,
            urgency
          }
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }
    }

    // Send SMS for high urgency notifications
    if (urgency === 'high' && 
        user.notificationSettings?.sms?.enabled && 
        user.phone) {
      try {
        await smsService.sendSMS({
          to: user.phone,
          message: `${title}: ${message}`
        });
      } catch (smsError) {
        console.error('SMS notification failed:', smsError);
      }
    }

    return {
      success: true,
      notification
    };

  } catch (error) {
    console.error('Failed to create notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send bulk notification to multiple users
 */
const sendBulkNotification = async (userIds, data) => {
  try {
    const { type, title, message, link, metadata, urgency = 'normal' } = data;
    const results = [];

    // Process in batches of 500 (Firestore limit)
    const batchSize = 500;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      
      // Create notifications in batch
      const notifications = batch.map(userId => ({
        userId,
        type,
        title,
        message,
        link,
        metadata: metadata || {},
        urgency,
        read: false,
        createdAt: new Date().toISOString()
      }));

      await batchWrite(NOTIFICATIONS, notifications);

      // Emit to all connected users
      const io = getIO();
      batch.forEach(userId => {
        io.to(`user-${userId}`).emit('notification', {
          userId,
          type,
          title,
          message,
          link,
          metadata: metadata || {},
          urgency,
          read: false,
          createdAt: new Date().toISOString()
        });
      });

      results.push(...notifications);
    }

    return {
      success: true,
      notifications: results,
      count: userIds.length
    };

  } catch (error) {
    console.error('Failed to send bulk notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send university-wide announcement
 */
const sendUniversityAnnouncement = async (universityId, data) => {
  try {
    // Get all users from the university
    const users = await getCollection(USERS, [
      ['university', '==', universityId]
    ]);

    const userIds = users.map(user => user.id);
    
    if (userIds.length === 0) {
      return {
        success: false,
        error: 'No users found for this university'
      };
    }

    return await sendBulkNotification(userIds, {
      ...data,
      urgency: 'high' // University announcements are high priority
    });

  } catch (error) {
    console.error('Failed to send university announcement:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send push notification to user
 */
const sendPushNotification = async (subscription, payload) => {
  try {
    await webPush.sendNotification(subscription, JSON.stringify(payload));
    return { success: true };
  } catch (error) {
    console.error('Push notification error:', error);
    
    // If subscription is invalid, remove it
    if (error.statusCode === 410) {
      // TODO: Remove invalid subscription from user document
      console.log('Invalid push subscription, should be removed');
    }
    
    throw error;
  }
};

/**
 * Get user notifications with pagination
 */
const getUserNotifications = async (userId, page = 1, limit = 20, filters = {}) => {
  try {
    const notifications = await getCollection(NOTIFICATIONS, [
      ['userId', '==', userId]
    ]);

    // Sort by date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply filters
    let filteredNotifications = notifications;
    
    if (filters.unread === 'true') {
      filteredNotifications = notifications.filter(n => !n.read);
    }
    
    if (filters.type) {
      filteredNotifications = filteredNotifications.filter(n => n.type === filters.type);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

    // Count unread notifications
    const unreadCount = notifications.filter(n => !n.read).length;

    return {
      success: true,
      notifications: paginatedNotifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total: filteredNotifications.length,
        totalPages: Math.ceil(filteredNotifications.length / limit)
      }
    };

  } catch (error) {
    console.error('Error getting user notifications:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Mark notification as read
 */
const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await getDoc(NOTIFICATIONS, notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Access denied');
    }

    await updateDoc(NOTIFICATIONS, notificationId, {
      read: true,
      readAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Notification marked as read'
    };

  } catch (error) {
    console.error('Error marking notification as read:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Mark all notifications as read for user
 */
const markAllNotificationsAsRead = async (userId) => {
  try {
    const notifications = await getCollection(NOTIFICATIONS, [
      ['userId', '==', userId],
      ['read', '==', false]
    ]);

    const updates = notifications.map(notification => ({
      id: notification.id,
      data: {
        read: true,
        readAt: new Date().toISOString()
      }
    }));

    await batchWrite(NOTIFICATIONS, updates);

    return {
      success: true,
      message: 'All notifications marked as read',
      count: notifications.length
    };

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete notification
 */
const deleteNotification = async (notificationId, userId) => {
  try {
    const notification = await getDoc(NOTIFICATIONS, notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Access denied');
    }

    await updateDoc(NOTIFICATIONS, notificationId, {
      deleted: true,
      deletedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Notification deleted successfully'
    };

  } catch (error) {
    console.error('Error deleting notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get user notification settings
 */
const getUserNotificationSettings = async (userId) => {
  try {
    const user = await getDoc(USERS, userId);
    if (!user) {
      throw new Error('User not found');
    }

    const defaultSettings = {
      inApp: {
        new_event: true,
        post_liked: true,
        post_commented: true,
        club_approved: true,
        payment_confirmed: true,
        badge_earned: true,
        new_message: true,
        leaderboard_change: true,
        marketplace_message: true,
        announcement: true
      },
      email: {
        new_event: true,
        post_liked: false,
        post_commented: false,
        club_approved: true,
        payment_confirmed: true,
        badge_earned: true,
        new_message: false,
        leaderboard_change: false,
        marketplace_message: false,
        announcement: true
      },
      sms: {
        enabled: false,
        phone: user.phone || ''
      },
      doNotDisturb: {
        enabled: false,
        from: '22:00',
        to: '07:00'
      },
      push: {
        new_event: true,
        post_liked: true,
        post_commented: true,
        club_approved: true,
        payment_confirmed: true,
        badge_earned: true,
        new_message: true,
        leaderboard_change: false,
        marketplace_message: true,
        announcement: true
      }
    };

    const settings = user.notificationSettings || defaultSettings;

    return {
      success: true,
      settings
    };

  } catch (error) {
    console.error('Error getting notification settings:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update user notification settings
 */
const updateUserNotificationSettings = async (userId, settings) => {
  try {
    const user = await getDoc(USERS, userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate settings structure
    const validSettings = {
      inApp: settings.inApp || {},
      email: settings.email || {},
      sms: settings.sms || {},
      doNotDisturb: settings.doNotDisturb || {},
      push: settings.push || {}
    };

    // Validate Do Not Disturb time format
    if (validSettings.doNotDisturb.from && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(validSettings.doNotDisturb.from)) {
      throw new Error('Invalid "from" time format. Use HH:MM');
    }
    
    if (validSettings.doNotDisturb.to && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(validSettings.doNotDisturb.to)) {
      throw new Error('Invalid "to" time format. Use HH:MM');
    }

    await updateDoc(USERS, userId, {
      notificationSettings: validSettings,
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Notification settings updated successfully'
    };

  } catch (error) {
    console.error('Error updating notification settings:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Save push subscription for user
 */
const savePushSubscription = async (userId, subscription) => {
  try {
    const user = await getDoc(USERS, userId);
    if (!user) {
      throw new Error('User not found');
    }

    await updateDoc(USERS, userId, {
      pushSubscription: subscription,
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Push subscription saved successfully'
    };

  } catch (error) {
    console.error('Error saving push subscription:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  createNotification,
  sendBulkNotification,
  sendUniversityAnnouncement,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUserNotificationSettings,
  updateUserNotificationSettings,
  savePushSubscription,
  NOTIFICATION_TYPES
};
