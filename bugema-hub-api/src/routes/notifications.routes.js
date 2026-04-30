const express = require('express');
const { body, param, query } = require('express-validator');
const notificationsController = require('../controllers/notifications.controller');
const { verifyToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Get user notifications
router.get('/',
  verifyToken,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('type').optional().isIn(['event', 'club', 'job', 'post', 'message', 'system']),
    query('read').optional().isBoolean()
  ],
  handleValidationErrors,
  notificationsController.getNotificationsController
);

// Mark notification as read
router.put('/:id/read',
  verifyToken,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  notificationsController.markAsReadController
);

// Mark all notifications as read
router.put('/read-all',
  verifyToken,
  notificationsController.markAllAsReadController
);

// Delete notification
router.delete('/:id',
  verifyToken,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  notificationsController.deleteNotificationController
);


// Get notification settings
router.get('/settings',
  verifyToken,
  notificationsController.getNotificationSettingsController
);

// Update notification settings
router.put('/settings',
  verifyToken,
  [
    body('emailNotifications').isBoolean(),
    body('pushNotifications').isBoolean(),
    body('eventReminders').isBoolean(),
    body('clubUpdates').isBoolean(),
    body('jobAlerts').isBoolean(),
    body('messageNotifications').isBoolean()
  ],
  handleValidationErrors,
  notificationsController.updateNotificationSettingsController
);

module.exports = router;
