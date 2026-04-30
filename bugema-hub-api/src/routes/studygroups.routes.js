const express = require('express');
const { body, param, query } = require('express-validator');
const studygroupsController = require('../controllers/studygroups.controller');
const { verifyToken } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Create new study group
router.post('/',
  verifyToken,
  uploadSingle('image'),
  [
    body('name').notEmpty().isLength({ max: 100 }),
    body('description').notEmpty().isLength({ max: 1000 }),
    body('subject').notEmpty(),
    body('maxMembers').isInt({ min: 2, max: 50 }),
    body('meetingSchedule').optional().isLength({ max: 200 }),
    body('location').optional().isLength({ max: 100 }),
    body('online').isBoolean()
  ],
  handleValidationErrors,
  studygroupsController.createStudyGroup
);

// Get all study groups with pagination and filters
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('subject').optional().isLength({ min: 1, max: 100 }),
    query('online').optional().isBoolean(),
    query('search').optional().isLength({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  studygroupsController.getAllStudyGroups
);

// Get study group by ID
router.get('/:id',
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  studygroupsController.getStudyGroupById
);

// Join study group
router.post('/:id/join',
  verifyToken,
  [
    param('id').isAlphanumeric(),
    body('message').optional().isLength({ max: 500 })
  ],
  handleValidationErrors,
  studygroupsController.joinStudyGroup
);

// Leave study group
router.delete('/:id/join',
  verifyToken,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  studygroupsController.leaveStudyGroup
);

// Get study group members
router.get('/:id/members',
  verifyToken,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  studygroupsController.getStudyGroupMembers
);

// Update study group
router.put('/:id',
  verifyToken,
  [
    param('id').isAlphanumeric(),
    body('name').optional().notEmpty().isLength({ max: 100 }),
    body('description').optional().notEmpty().isLength({ max: 1000 }),
    body('maxMembers').optional().isInt({ min: 2, max: 50 })
  ],
  handleValidationErrors,
  studygroupsController.updateStudyGroup
);

// Delete study group
router.delete('/:id',
  verifyToken,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  studygroupsController.deleteStudyGroup
);

module.exports = router;
