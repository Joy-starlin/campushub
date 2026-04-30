const { 
  getDoc, 
  getCollection, 
  updateDoc 
} = require('../utils/db.helpers');
const { 
  USERS 
} = require('../utils/collections');
const { 
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
  removePushSubscription,
  NOTIFICATION_TYPES
} = require('../services/notification.service');
const { 
  successResponse, 
  errorResponse, 
  createdResponse, 
  notFoundResponse 
} = require('../utils/response');

/**
 * Get user notifications with pagination and filters
 */
const getNotificationsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unread, type } = req.query;

    const filters = {};
    if (unread === 'true') {
      filters.unread = 'true';
    }
    if (type) {
      filters.type = type;
    }

    const result = await getUserNotifications(userId, parseInt(page), parseInt(limit), filters);

    if (!result.success) {
      return errorResponse(res, result.error, 500);
    }

    return successResponse(res, result);

  } catch (error) {
    console.error('Error getting notifications:', error);
    return errorResponse(res, 'Failed to fetch notifications', 500);
  }
};

/**
 * Mark notification as read
 */
const markAsReadController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await markNotificationAsRead(id, userId);

    if (!result.success) {
      return errorResponse(res, result.error, 400);
    }

    return successResponse(res, null, result.message);

  } catch (error) {
    console.error('Error marking notification as read:', error);
    return errorResponse(res, 'Failed to mark notification as read', 500);
  }
};

/**
 * Mark all notifications as read for current user
 */
const markAllAsReadController = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await markAllNotificationsAsRead(userId);

    if (!result.success) {
      return errorResponse(res, result.error, 500);
    }

    return successResponse(res, { count: result.count }, result.message);

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return errorResponse(res, 'Failed to mark all notifications as read', 500);
  }
};

/**
 * Delete notification
 */
const deleteNotificationController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await deleteNotification(id, userId);

    if (!result.success) {
      return errorResponse(res, result.error, 400);
    }

    return successResponse(res, null, result.message);

  } catch (error) {
    console.error('Error deleting notification:', error);
    return errorResponse(res, 'Failed to delete notification', 500);
  }
};

/**
 * Get user notification settings
 */
const getNotificationSettingsController = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await getUserNotificationSettings(userId);

    if (!result.success) {
      return errorResponse(res, result.error, 500);
    }

    return successResponse(res, result);

  } catch (error) {
    console.error('Error getting notification settings:', error);
    return errorResponse(res, 'Failed to fetch notification settings', 500);
  }
};

/**
 * Update user notification settings
 */
const updateNotificationSettingsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = req.body;

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
      return errorResponse(res, 'Invalid "from" time format. Use HH:MM', 400);
    }
    
    if (validSettings.doNotDisturb.to && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(validSettings.doNotDisturb.to)) {
      return errorResponse(res, 'Invalid "to" time format. Use HH:MM', 400);
    }

    // Validate phone number if SMS is enabled
    if (validSettings.sms.enabled && !validSettings.sms.phone) {
      return errorResponse(res, 'Phone number is required when SMS is enabled', 400);
    }

    if (validSettings.sms.phone && !/^2567\d{8}$/.test(validSettings.sms.phone)) {
      return errorResponse(res, 'Invalid phone number format. Use 2567XXXXXXXX', 400);
    }

    const result = await updateUserNotificationSettings(userId, validSettings);

    if (!result.success) {
      return errorResponse(res, result.error, 400);
    }

    return successResponse(res, null, result.message);

  } catch (error) {
    console.error('Error updating notification settings:', error);
    return errorResponse(res, 'Failed to update notification settings', 500);
  }
};

/**
 * Save push subscription for user
 */
const savePushSubscriptionController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscription } = req.body;

    if (!subscription) {
      return errorResponse(res, 'Push subscription object is required', 400);
    }

    // Validate subscription structure
    if (!subscription.endpoint || !subscription.keys) {
      return errorResponse(res, 'Invalid push subscription format', 400);
    }

    const result = await savePushSubscription(userId, subscription);

    if (!result.success) {
      return errorResponse(res, result.error, 400);
    }

    return successResponse(res, null, result.message);

  } catch (error) {
    console.error('Error saving push subscription:', error);
    return errorResponse(res, 'Failed to save push subscription', 500);
  }
};

/**
 * Create notification (admin only)
 */
const createNotificationAdmin = async (req, res) => {
  try {
    const { userId, type, title, message, link, metadata, urgency = 'normal' } = req.body;

    if (!userId || !type || !title || !message) {
      return errorResponse(res, 'Missing required fields: userId, type, title, message', 400);
    }

    if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
      return errorResponse(res, 'Invalid notification type', 400);
    }

    const notificationData = {
      type,
      title,
      message,
      link,
      metadata: metadata || {},
      urgency
    };

    const result = await createNotification(userId, notificationData);

    if (!result.success) {
      return errorResponse(res, result.error, 500);
    }

    return createdResponse(res, { notification: result.notification }, 'Notification created successfully');

  } catch (error) {
    console.error('Error creating notification:', error);
    return errorResponse(res, 'Failed to create notification', 500);
  }
};

/**
 * Send bulk notification (admin only)
 */
const sendBulkNotificationAdmin = async (req, res) => {
  try {
    const { userIds, type, title, message, link, metadata, urgency = 'normal' } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return errorResponse(res, 'User IDs array is required', 400);
    }

    if (!type || !title || !message) {
      return errorResponse(res, 'Missing required fields: type, title, message', 400);
    }

    if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
      return errorResponse(res, 'Invalid notification type', 400);
    }

    const notificationData = {
      type,
      title,
      message,
      link,
      metadata: metadata || {},
      urgency
    };

    const result = await sendBulkNotification(userIds, notificationData);

    if (!result.success) {
      return errorResponse(res, result.error, 500);
    }

    return createdResponse(res, { 
      count: result.count,
      notifications: result.notifications 
    }, 'Bulk notification sent successfully');

  } catch (error) {
    console.error('Error sending bulk notification:', error);
    return errorResponse(res, 'Failed to send bulk notification', 500);
  }
};

/**
 * Send university announcement (admin only)
 */
const sendUniversityAnnouncementAdmin = async (req, res) => {
  try {
    const { universityId, type, title, message, link, metadata } = req.body;

    if (!universityId || !title || !message) {
      return errorResponse(res, 'Missing required fields: universityId, title, message', 400);
    }

    const notificationData = {
      type: type || NOTIFICATION_TYPES.ANNOUNCEMENT,
      title,
      message,
      link,
      metadata: metadata || {},
      urgency: 'high'
    };

    const result = await sendUniversityAnnouncement(universityId, notificationData);

    if (!result.success) {
      return errorResponse(res, result.error, 500);
    }

    return createdResponse(res, { 
      count: result.count,
      notifications: result.notifications 
    }, 'University announcement sent successfully');

  } catch (error) {
    console.error('Error sending university announcement:', error);
    return errorResponse(res, 'Failed to send university announcement', 500);
  }
};

/**
 * Get notification statistics (admin only)
 */
const getNotificationStats = async (req, res) => {
  try {
    const { userId, type, dateFrom, dateTo } = req.query;
    const filters = [];

    if (userId) {
      filters.push(['userId', '==', userId]);
    }

    if (type) {
      filters.push(['type', '==', type]);
    }

    const notifications = await getCollection(NOTIFICATIONS, filters);

    // Filter by date range if provided
    let filteredNotifications = notifications;
    if (dateFrom || dateTo) {
      filteredNotifications = notifications.filter(notification => {
        const notificationDate = new Date(notification.createdAt);
        if (dateFrom && notificationDate < new Date(dateFrom)) return false;
        if (dateTo && notificationDate > new Date(dateTo)) return false;
        return true;
      });
    }

    // Calculate statistics
    const stats = {
      total: filteredNotifications.length,
      read: filteredNotifications.filter(n => n.read).length,
      unread: filteredNotifications.filter(n => !n.read).length,
      byType: {},
      byUrgency: {
        normal: 0,
        high: 0
      }
    };

    filteredNotifications.forEach(notification => {
      // Count by type
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
      
      // Count by urgency
      if (notification.urgency === 'high') {
        stats.byUrgency.high++;
      } else {
        stats.byUrgency.normal++;
      }
    });

    return successResponse(res, stats);

  } catch (error) {
    console.error('Error getting notification stats:', error);
    return errorResponse(res, 'Failed to fetch notification statistics', 500);
  }
};

module.exports = {
  getNotificationsController,
  markAsReadController,
  markAllAsReadController,
  deleteNotificationController,
  getNotificationSettingsController,
  updateNotificationSettingsController,
  savePushSubscriptionController,
  createNotificationAdmin,
  sendBulkNotificationAdmin,
  sendUniversityAnnouncementAdmin,
  getNotificationStats
};
