const express = require('express');
const { body, param, query } = require('express-validator');
const paymentsController = require('../controllers/payments.controller');
const { verifyToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// Create payment
router.post('/',
  verifyToken,
  [
    body('type').isIn(['event-registration', 'club-membership', 'marketplace', 'donation', 'other']),
    body('amount').isFloat({ min: 0.01 }),
    body('currency').isIn(['USD', 'UGX', 'EUR']),
    body('description').notEmpty().isLength({ max: 500 }),
    body('referenceId').optional().isAlphanumeric(),
    body('paymentMethod').isIn(['card', 'mobile-money', 'bank-transfer', 'paypal'])
  ],
  handleValidationErrors,
  paymentsController.createStripeCheckoutSession
);

// Get payment by ID
router.get('/:id',
  verifyToken,
  [
    param('id').isAlphanumeric()
  ],
  handleValidationErrors,
  paymentsController.getPaymentHistory
);

// Get user payments
router.get('/user/:userId',
  verifyToken,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('status').optional().isIn(['pending', 'completed', 'failed', 'refunded']),
    query('type').optional().isIn(['event-registration', 'club-membership', 'marketplace', 'donation', 'other'])
  ],
  handleValidationErrors,
  paymentsController.getPaymentHistory
);





module.exports = router;
