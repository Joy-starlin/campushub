const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { 
  getDoc, 
  getCollection, 
  createDoc, 
  updateDoc 
} = require('../utils/db.helpers');
const { 
  USERS, 
  PAYMENTS, 
  SUBSCRIPTIONS 
} = require('../utils/collections');
const { 
  createStripeCheckout,
  processMTNPayment,
  processAirtelPayment,
  getTransactionStatus,
  getUserPaymentHistory,
  getUserSubscription,
  cancelSubscription,
  upgradePlan,
  getExchangeRate,
  PLANS
} = require('../services/payment.service');
const flutterwaveService = require('../services/flutterwave.service');
const { 
  successResponse, 
  errorResponse, 
  createdResponse, 
  notFoundResponse 
} = require('../utils/response');

/**
 * Create Stripe Checkout Session
 */
const createStripeCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user.id;

    if (!plan || !PLANS[plan]) {
      return errorResponse(res, 'Invalid plan specified', 400);
    }

    const user = await getDoc(USERS, userId);
    if (!user) {
      return notFoundResponse(res, 'User not found');
    }

    const result = await createStripeCheckout(userId, plan, user.email);

    if (!result.success) {
      return errorResponse(res, result.error, 400);
    }

    return createdResponse(res, { 
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId
    }, 'Checkout session created');

  } catch (error) {
    console.error('Error creating Stripe checkout:', error);
    return errorResponse(res, 'Failed to create checkout session', 500);
  }
};

/**
 * Handle Stripe webhook
 */
const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      console.error('Missing Stripe signature or webhook secret');
      return res.status(400).send('Webhook signature verification failed');
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    res.status(500).send('Webhook processing failed');
  }
};

/**
 * Request MTN Mobile Money payment
 */
const requestMTNPayment = async (req, res) => {
  try {
    const { phone, amount, currency, plan } = req.body;
    const userId = req.user.id;

    if (!phone || !amount || !currency || !plan) {
      return errorResponse(res, 'Missing required fields', 400);
    }

    if (!PLANS[plan]) {
      return errorResponse(res, 'Invalid plan specified', 400);
    }

    // Validate phone number (Uganda format)
    if (!/^2567\d{8}$/.test(phone)) {
      return errorResponse(res, 'Invalid phone number format. Use 2567XXXXXXXX', 400);
    }

    const result = await processMTNPayment(phone, amount, currency, plan, userId);

    if (!result.success) {
      return errorResponse(res, result.error, 400);
    }

    return createdResponse(res, {
      transactionId: result.transactionId,
      status: result.status
    }, 'MTN Mobile Money payment initiated');

  } catch (error) {
    console.error('Error requesting MTN payment:', error);
    return errorResponse(res, 'Failed to initiate MTN payment', 500);
  }
};

/**
 * Get MTN transaction status
 */
const getMTNTransactionStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const result = await getTransactionStatus(transactionId);

    if (!result.success) {
      return errorResponse(res, result.error, 404);
    }

    // Verify user owns this transaction
    if (result.transaction.userId !== userId) {
      return errorResponse(res, 'Access denied', 403);
    }

    return successResponse(res, {
      transactionId,
      status: result.status,
      transaction: result.transaction
    });

  } catch (error) {
    console.error('Error getting MTN transaction status:', error);
    return errorResponse(res, 'Failed to get transaction status', 500);
  }
};

/**
 * Request Airtel Money payment
 */
const requestAirtelPayment = async (req, res) => {
  try {
    const { phone, amount, currency, plan } = req.body;
    const userId = req.user.id;

    if (!phone || !amount || !currency || !plan) {
      return errorResponse(res, 'Missing required fields', 400);
    }

    if (!PLANS[plan]) {
      return errorResponse(res, 'Invalid plan specified', 400);
    }

    // Validate phone number (Uganda format)
    if (!/^2567\d{8}$/.test(phone)) {
      return errorResponse(res, 'Invalid phone number format. Use 2567XXXXXXXX', 400);
    }

    const result = await processAirtelPayment(phone, amount, currency, plan, userId);

    if (!result.success) {
      return errorResponse(res, result.error, 400);
    }

    return createdResponse(res, {
      transactionId: result.transactionId,
      status: result.status
    }, 'Airtel Money payment initiated');

  } catch (error) {
    console.error('Error requesting Airtel payment:', error);
    return errorResponse(res, 'Failed to initiate Airtel payment', 500);
  }
};

/**
 * Request Flutterwave Mobile Money payment
 */
const requestFlutterwavePayment = async (req, res) => {
  try {
    const { phone, amount, currency, plan, network } = req.body;
    const userId = req.user.id;

    if (!phone || !amount || !currency || !plan || !network) {
      return errorResponse(res, 'Missing required fields', 400);
    }

    if (!PLANS[plan]) {
      return errorResponse(res, 'Invalid plan specified', 400);
    }

    const user = await getDoc(USERS, userId);
    if (!user) {
      return notFoundResponse(res, 'User not found');
    }

    const tx_ref = `BUGEMA-${plan}-${userId}-${Date.now()}`;
    
    const paymentData = {
      amount,
      currency,
      email: user.email,
      tx_ref,
      phone_number: phone,
      network,
      fullname: `${user.firstName} ${user.lastName}`
    };

    const result = await flutterwaveService.initiateMobileMoneyPayment(paymentData);

    if (!result.success) {
      return errorResponse(res, result.error || 'Failed to initiate Flutterwave payment', 400);
    }

    // Create payment record
    const payment = await createDoc(PAYMENTS, {
      userId,
      plan,
      amount,
      currency,
      paymentMethod: 'flutterwave_momo',
      status: 'pending',
      transactionId: result.data?.id || tx_ref,
      tx_ref,
      network,
      phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return createdResponse(res, {
      transactionId: payment.id,
      tx_ref,
      status: 'pending',
      flutterwaveData: result.data
    }, 'Flutterwave payment initiated');

  } catch (error) {
    console.error('Error requesting Flutterwave payment:', error);
    return errorResponse(res, 'Failed to initiate Flutterwave payment', 500);
  }
};

/**
 * Verify Flutterwave transaction
 */
const verifyFlutterwaveTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const result = await flutterwaveService.verifyTransaction(transactionId);

    if (!result.success) {
      return errorResponse(res, result.error || 'Failed to verify transaction', 400);
    }

    // Update payment record if transaction is successful
    if (result.data?.status === 'successful') {
      const payment = await getDoc(PAYMENTS, result.data.tx_ref);
      if (payment && payment.status === 'pending') {
        await updateDoc(PAYMENTS, payment.id, {
          status: 'completed',
          updatedAt: new Date().toISOString()
        });

        // Upgrade user plan
        await upgradePlan(payment.userId, payment.plan, {
          paymentMethod: 'flutterwave_momo',
          paymentId: transactionId,
          amount: payment.amount,
          currency: payment.currency
        });
      }
    }

    return successResponse(res, {
      transactionId,
      status: result.data?.status,
      data: result.data
    });

  } catch (error) {
    console.error('Error verifying Flutterwave transaction:', error);
    return errorResponse(res, 'Failed to verify transaction', 500);
  }
};

/**
 * Handle Airtel Money callback
 */
const handleAirtelCallback = async (req, res) => {
  try {
    const { transaction_id, status } = req.body;

    if (!transaction_id || !status) {
      return res.status(400).json({ error: 'Missing transaction data' });
    }

    // Verify request is from Airtel (IP whitelist in production)
    const clientIP = req.ip || req.connection.remoteAddress;
    const allowedIPs = process.env.AIRTEL_CALLBACK_IPS?.split(',') || [];
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      console.warn('Unauthorized Airtel callback from IP:', clientIP);
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update transaction status
    const transaction = await getDoc(PAYMENTS, transaction_id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await updateDoc(PAYMENTS, transaction_id, {
      status: status.toLowerCase(),
      updatedAt: new Date().toISOString()
    });

    // If payment successful, upgrade plan
    if (status.toLowerCase() === 'successful') {
      await upgradePlan(transaction.userId, transaction.plan, {
        paymentMethod: 'airtel_money',
        paymentId: transaction_id,
        amount: transaction.amount,
        currency: transaction.currency
      });
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Error handling Airtel callback:', error);
    res.status(500).json({ error: 'Callback processing failed' });
  }
};

/**
 * Get user payment history
 */
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const result = await getUserPaymentHistory(userId, parseInt(page), parseInt(limit));

    if (!result.success) {
      return errorResponse(res, result.error, 500);
    }

    return successResponse(res, result);

  } catch (error) {
    console.error('Error getting payment history:', error);
    return errorResponse(res, 'Failed to fetch payment history', 500);
  }
};

/**
 * Get user subscription
 */
const getSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await getUserSubscription(userId);

    if (!result.success) {
      return errorResponse(res, result.error, 500);
    }

    return successResponse(res, result);

  } catch (error) {
    console.error('Error getting subscription:', error);
    return errorResponse(res, 'Failed to fetch subscription', 500);
  }
};

/**
 * Cancel subscription
 */
const cancelUserSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await cancelSubscription(userId);

    if (!result.success) {
      return errorResponse(res, result.error, 400);
    }

    return successResponse(res, null, result.message);

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return errorResponse(res, 'Failed to cancel subscription', 500);
  }
};

/**
 * Get exchange rate
 */
const getCurrencyExchangeRate = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return errorResponse(res, 'Missing from or to currency parameters', 400);
    }

    const result = await getExchangeRate(from.toUpperCase(), to.toUpperCase());

    if (!result.success) {
      return errorResponse(res, result.error, 400);
    }

    return successResponse(res, result);

  } catch (error) {
    console.error('Error getting exchange rate:', error);
    return errorResponse(res, 'Failed to get exchange rate', 500);
  }
};

// Helper functions for webhook handlers
const handleCheckoutSessionCompleted = async (session) => {
  try {
    const { userId, plan } = session.metadata;
    
    if (!userId || !plan) {
      console.error('Missing metadata in checkout session');
      return;
    }

    // Create payment record
    await createDoc(PAYMENTS, {
      userId,
      type: 'subscription',
      plan,
      amount: PLANS[plan].price,
      currency: PLANS[plan].currency,
      paymentMethod: 'stripe',
      referenceId: session.id,
      status: 'completed',
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });

    // Upgrade user plan
    await upgradePlan(userId, plan, {
      paymentMethod: 'stripe',
      paymentId: session.id,
      amount: PLANS[plan].price,
      currency: PLANS[plan].currency
    });

    console.log(`Successfully upgraded user ${userId} to ${plan} plan`);

  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
};

const handleSubscriptionDeleted = async (subscription) => {
  try {
    // Find user subscription by Stripe subscription ID
    const userSubscriptions = await getCollection(SUBSCRIPTIONS, [
      ['paymentId', '==', subscription.id]
    ]);

    if (userSubscriptions.length > 0) {
      const userSubscription = userSubscriptions[0];
      
      await updateDoc(SUBSCRIPTIONS, userSubscription.id, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      });

      // Downgrade user to free plan
      await updateDoc(USERS, userSubscription.userId, {
        role: 'student',
        subscriptionPlan: null,
        updatedAt: new Date().toISOString()
      });

      console.log(`Cancelled subscription for user ${userSubscription.userId}`);
    }

  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
};

const handlePaymentFailed = async (invoice) => {
  try {
    const subscriptionId = invoice.subscription;
    
    // Find user subscription by Stripe subscription ID
    const userSubscriptions = await getCollection(SUBSCRIPTIONS, [
      ['paymentId', '==', subscriptionId]
    ]);

    if (userSubscriptions.length > 0) {
      const userSubscription = userSubscriptions[0];
      const user = await getDoc(USERS, userSubscription.userId);

      // Send retry email
      if (user && user.email) {
        // TODO: Send email notification about payment failure
        console.log(`Payment failed for user ${userSubscription.userId}, email: ${user.email}`);
      }
    }

  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
};

/**
 * Handle Flutterwave Webhook
 */
const handleFlutterwaveWebhook = async (req, res) => {
  try {
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers['verif-hash'];

    if (!signature || (secretHash && signature !== secretHash)) {
      // This request isn't from Flutterwave; discard it.
      return res.status(401).end();
    }

    const payload = req.body;
    
    if (payload.event === 'charge.completed') {
      const { tx_ref, status, id, amount, currency, customer } = payload.data;
      
      if (status === 'successful') {
        // Find transaction in our DB
        const transactions = await getCollection(PAYMENTS, [
          ['referenceId', '==', tx_ref]
        ]);

        if (transactions.length > 0) {
          const transaction = transactions[0];
          
          if (transaction.status !== 'completed') {
            // Update transaction status
            await updateDoc(PAYMENTS, transaction.id, {
              status: 'completed',
              flw_id: id,
              updatedAt: new Date().toISOString()
            });

            // Upgrade user plan
            await upgradePlan(transaction.userId, transaction.plan, {
              paymentMethod: transaction.paymentMethod,
              paymentId: id.toString(),
              amount,
              currency
            });

            console.log(`Webhhok: Upgraded user ${transaction.userId} via Flutterwave`);
          }
        }
      }
    }

    res.status(200).end();

  } catch (error) {
    console.error('Flutterwave Webhook Error:', error);
    res.status(500).end();
  }
};

module.exports = {
  createStripeCheckoutSession,
  handleStripeWebhook,
  requestMTNPayment,
  getMTNTransactionStatus,
  requestAirtelPayment,
  handleAirtelCallback,
  getPaymentHistory,
  getSubscription,
  cancelUserSubscription,
  getCurrencyExchangeRate,
  requestFlutterwavePayment,
  verifyFlutterwaveTransaction
};
