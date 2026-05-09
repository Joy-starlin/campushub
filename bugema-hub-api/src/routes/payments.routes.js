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

// Request MTN MoMo payment
router.post('/momo/request',
  verifyToken,
  [
    body('phone').notEmpty().matches(/^2567\d{8}$/).withMessage('Invalid phone number format. Use 2567XXXXXXXX'),
    body('amount').isNumeric(),
    body('currency').isIn(['UGX']),
    body('plan').notEmpty()
  ],
  handleValidationErrors,
  paymentsController.requestMTNPayment
);

// Get MTN transaction status
router.get('/momo/status/:transactionId',
  verifyToken,
  paymentsController.getMTNTransactionStatus
);

// Request Airtel Money payment
router.post('/airtel/request',
  verifyToken,
  [
    body('phone').notEmpty().matches(/^2567\d{8}$/).withMessage('Invalid phone number format. Use 2567XXXXXXXX'),
    body('amount').isNumeric(),
    body('currency').isIn(['UGX']),
    body('plan').notEmpty()
  ],
  handleValidationErrors,
  paymentsController.requestAirtelPayment
);

// Request Flutterwave Mobile Money payment
router.post('/flutterwave/request',
  verifyToken,
  [
    body('phone').notEmpty().matches(/^2567\d{8}$/).withMessage('Invalid phone number format. Use 2567XXXXXXXX'),
    body('amount').isNumeric(),
    body('currency').isIn(['UGX']),
    body('plan').notEmpty(),
    body('network').isIn(['MTN', 'AIRTEL']).withMessage('Network must be MTN or AIRTEL')
  ],
  handleValidationErrors,
  paymentsController.requestFlutterwavePayment
);

// Verify Flutterwave transaction
router.get('/flutterwave/verify/:transactionId',
  verifyToken,
  paymentsController.verifyFlutterwaveTransaction
);

module.exports = router;
