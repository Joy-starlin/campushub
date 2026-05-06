const express = require('express');
const { body, param, query } = require('express-validator');
const ridesController = require('../controllers/rides.controller');
const { verifyToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Create new ride
router.post('/',
  verifyToken,
  [
    body('origin').notEmpty(),
    body('destination').notEmpty(),
    body('departureTime').isISO8601(),
    body('seatsAvailable').isInt({ min: 1, max: 10 }),
    body('price').isFloat({ min: 0 }),
    body('vehicle').optional().isLength({ max: 50 }),
    body('notes').optional().isLength({ max: 500 })
  ],
  handleValidationErrors,
  ridesController.createRide
);

// Get all rides with pagination and filters
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('origin').optional().isLength({ min: 1, max: 100 }),
    query('destination').optional().isLength({ min: 1, max: 100 }),
    query('date').optional().isISO8601(),
    query('seatsAvailable').optional().isInt({ min: 1 })
  ],
  handleValidationErrors,
  ridesController.getAllRides
);

// Get ride by ID
router.get('/:id',
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  ridesController.getRideById
);

// Book ride seat
router.post('/:id/book',
  verifyToken,
  [
    param('id').isAlphanumeric(),
    body('seats').isInt({ min: 1, max: 5 })
  ],
  handleValidationErrors,
  ridesController.bookRide
);

// Cancel ride booking
router.delete('/:id/book',
  verifyToken,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  ridesController.cancelBooking
);

// Get ride passengers
router.get('/:id/passengers',
  verifyToken,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  ridesController.getRidePassengers
);

// Update ride
router.put('/:id',
  verifyToken,
  [
    param('id').isAlphanumeric(),
    body('departureTime').optional().isISO8601(),
    body('seatsAvailable').optional().isInt({ min: 1, max: 10 }),
    body('price').optional().isFloat({ min: 0 }),
    body('status').optional().isIn(['active', 'full', 'cancelled'])
  ],
  handleValidationErrors,
  ridesController.updateRide
);

// Delete ride
router.delete('/:id',
  verifyToken,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  ridesController.deleteRide
);

module.exports = router;
