const express = require('express');
const { body, param, query } = require('express-validator');
const eventsController = require('../controllers/events.controller');
const { verifyToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Create new event (club admin or admin only)
router.post('/',
  verifyToken,
  upload.single('banner'),
  [
    body('title').isLength({ min: 5, max: 200 }).trim()
      .withMessage('Title must be between 5 and 200 characters'),
    body('description').isLength({ min: 20, max: 5000 }).trim()
      .withMessage('Description must be between 20 and 5000 characters'),
    body('category').isIn(['workshop', 'seminar', 'social', 'sports', 'academic', 'career', 'cultural', 'volunteer', 'other'])
      .withMessage('Invalid category'),
    body('startDate').isISO8601()
      .withMessage('Invalid start date format'),
    body('endDate').isISO8601()
      .withMessage('Invalid end date format'),
    body('timezone').optional().isLength({ min: 3, max: 50 })
      .withMessage('Invalid timezone'),
    body('location').optional().isLength({ min: 5, max: 200 }).trim()
      .withMessage('Location must be between 5 and 200 characters'),
    body('isOnline').optional().isBoolean()
      .withMessage('isOnline must be a boolean'),
    body('meetLink').optional().isURL()
      .withMessage('Invalid Meet link format'),
    body('zoomLink').optional().isURL()
      .withMessage('Invalid Zoom link format'),
    body('platform').optional().isIn(['google_meet', 'zoom', 'teams', 'skype', 'other'])
      .withMessage('Invalid platform'),
    body('maxAttendees').optional().isInt({ min: 1, max: 10000 })
      .withMessage('Max attendees must be between 1 and 10000'),
    body('university').optional().isLength({ min: 2, max: 100 }).trim()
      .withMessage('University name must be between 2 and 100 characters'),
    body('isGlobal').optional().isBoolean()
      .withMessage('isGlobal must be a boolean'),
    body('tags').optional().isArray()
      .withMessage('Tags must be an array')
  ],
  handleValidationErrors,
  eventsController.createEvent
);

// Get all events (public)
router.get('/',
  [
    query('category').optional().isIn(['workshop', 'seminar', 'social', 'sports', 'academic', 'career', 'cultural', 'volunteer', 'other'])
      .withMessage('Invalid category'),
    query('university').optional().isLength({ min: 2, max: 100 }).trim()
      .withMessage('University name must be between 2 and 100 characters'),
    query('from').optional().isISO8601()
      .withMessage('Invalid from date format'),
    query('to').optional().isISO8601()
      .withMessage('Invalid to date format'),
    query('isOnline').optional().isBoolean()
      .withMessage('isOnline must be a boolean'),
    query('page').optional().isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
  ],
  handleValidationErrors,
  eventsController.getAllEvents
);

// Get single event (public)
router.get('/:id',
  [
    param('id').isUUID().withMessage('Invalid event ID')
  ],
  handleValidationErrors,
  eventsController.getEventById
);

// Update event (organizer or admin only)
router.patch('/:id',
  verifyToken,
  upload.single('banner'),
  [
    param('id').isUUID().withMessage('Invalid event ID'),
    body('title').optional().isLength({ min: 5, max: 200 }).trim()
      .withMessage('Title must be between 5 and 200 characters'),
    body('description').optional().isLength({ min: 20, max: 5000 }).trim()
      .withMessage('Description must be between 20 and 5000 characters'),
    body('category').optional().isIn(['workshop', 'seminar', 'social', 'sports', 'academic', 'career', 'cultural', 'volunteer', 'other'])
      .withMessage('Invalid category'),
    body('startDate').optional().isISO8601()
      .withMessage('Invalid start date format'),
    body('endDate').optional().isISO8601()
      .withMessage('Invalid end date format'),
    body('timezone').optional().isLength({ min: 3, max: 50 })
      .withMessage('Invalid timezone'),
    body('location').optional().isLength({ min: 5, max: 200 }).trim()
      .withMessage('Location must be between 5 and 200 characters'),
    body('isOnline').optional().isBoolean()
      .withMessage('isOnline must be a boolean'),
    body('meetLink').optional().isURL()
      .withMessage('Invalid Meet link format'),
    body('zoomLink').optional().isURL()
      .withMessage('Invalid Zoom link format'),
    body('platform').optional().isIn(['google_meet', 'zoom', 'teams', 'skype', 'other'])
      .withMessage('Invalid platform'),
    body('maxAttendees').optional().isInt({ min: 1, max: 10000 })
      .withMessage('Max attendees must be between 1 and 10000'),
    body('university').optional().isLength({ min: 2, max: 100 }).trim()
      .withMessage('University name must be between 2 and 100 characters'),
    body('isGlobal').optional().isBoolean()
      .withMessage('isGlobal must be a boolean'),
    body('tags').optional().isArray()
      .withMessage('Tags must be an array')
  ],
  handleValidationErrors,
  eventsController.updateEvent
);

// Delete event
router.delete('/:id',
  verifyToken,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  eventsController.deleteEvent
);

module.exports = router;
