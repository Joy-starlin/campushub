const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { db } = require('../config/firebase');
const { 
  getDoc, 
  getCollection, 
  createDoc, 
  updateDoc,
  incrementField
} = require('../utils/db.helpers');
const { 
  USERS, 
  USER_POINTS, 
  PAYMENTS, 
  SUBSCRIPTIONS,
  NOTIFICATIONS 
} = require('../utils/collections');
const { emailService } = require('./email.service');
const { smsService } = require('./sms.service');
const axios = require('axios');
const flutterwaveService = require('./flutterwave.service');

// Plan configurations
const PLANS = {
  student_semester: {
    name: 'Student Member',
    price: 5000,
    currency: 'UGX',
    interval: 'semester',
    features: ['Academic resources', 'Event access', 'Basic profile', 'Community forums']
  },
  staff_semester: {
    name: 'Staff Member',
    price: 10000,
    currency: 'UGX',
    interval: 'semester',
    features: ['All student features', 'Priority support', 'Verified badge', 'Advanced analytics']
  }
};


// Create Stripe Checkout Session
const createStripeCheckout = async (userId, plan, userEmail) => {
  try {
    const planConfig = PLANS[plan];
    if (!planConfig) {
      throw new Error('Invalid plan');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: userEmail,
      line_items: [{
        price_data: {
          currency: planConfig.currency.toLowerCase(),
          product_data: {
            name: `Bugema Hub - ${planConfig.name} Plan`,
            description: planConfig.features.join(', '),
            images: [process.env.CLIENT_URL + '/logo.png']
          },
          unit_amount: Math.round(planConfig.price * 100),
          recurring: {
            interval: planConfig.interval
          }
        },
        quantity: 1
      }],
      metadata: {
        userId,
        plan
      },
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      billing_address_collection: 'auto',
      allow_promotion_codes: true
    });

    return {
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    };
  } catch (error) {
    console.error('Error creating Stripe checkout:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Process MTN Mobile Money payment
const processMTNPayment = async (phone, amount, currency, plan, userId) => {
  try {
    const planConfig = PLANS[plan];
    if (!planConfig) {
      throw new Error('Invalid plan');
    }

    const user = await getDoc(USERS, userId);
    if (!user) throw new Error('User not found');

    // Create transaction record
    const transaction = await createDoc(PAYMENTS, {
      userId,
      type: 'subscription',
      plan,
      amount,
      currency,
      paymentMethod: 'mtn_momo',
      phone,
      status: 'pending',
      referenceId: generateTransactionId(),
      createdAt: new Date().toISOString()
    });

    // Call Flutterwave for MoMo Payment
    const flwResponse = await flutterwaveService.initiateMobileMoneyPayment({
      amount,
      currency,
      email: user.email,
      tx_ref: transaction.referenceId,
      phone_number: phone,
      network: 'MTN',
      fullname: `${user.firstName} ${user.lastName}`
    });

    if (flwResponse.success) {
      return {
        success: true,
        transactionId: transaction.id,
        status: 'pending'
      };
    } else {
      await updateDoc(PAYMENTS, transaction.id, {
        status: 'failed',
        error: flwResponse.error,
        updatedAt: new Date().toISOString()
      });

      return {
        success: false,
        error: flwResponse.error
      };
    }
  } catch (error) {
    console.error('Error processing MTN payment:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Process Airtel Money payment
const processAirtelPayment = async (phone, amount, currency, plan, userId) => {
  try {
    const planConfig = PLANS[plan];
    if (!planConfig) {
      throw new Error('Invalid plan');
    }

    const user = await getDoc(USERS, userId);
    if (!user) throw new Error('User not found');

    // Create transaction record
    const transaction = await createDoc(PAYMENTS, {
      userId,
      type: 'subscription',
      plan,
      amount,
      currency,
      paymentMethod: 'airtel_money',
      phone,
      status: 'pending',
      referenceId: generateTransactionId(),
      createdAt: new Date().toISOString()
    });

    // Call Flutterwave for MoMo Payment
    const flwResponse = await flutterwaveService.initiateMobileMoneyPayment({
      amount,
      currency,
      email: user.email,
      tx_ref: transaction.referenceId,
      phone_number: phone,
      network: 'AIRTEL',
      fullname: `${user.firstName} ${user.lastName}`
    });

    if (flwResponse.success) {
      return {
        success: true,
        transactionId: transaction.id,
        status: 'pending',
        flw_ref: flwResponse.data.flw_ref
      };
    } else {
      await updateDoc(PAYMENTS, transaction.id, {
        status: 'failed',
        error: flwResponse.error,
        updatedAt: new Date().toISOString()
      });

      return {
        success: false,
        error: flwResponse.error
      };
    }
  } catch (error) {
    console.error('Error processing Airtel payment:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get transaction status
const getTransactionStatus = async (transactionId) => {
  try {
    const transaction = await getDoc(PAYMENTS, transactionId);
    if (!transaction) {
      return {
        success: false,
        error: 'Transaction not found'
      };
    }

    return {
      success: true,
      status: transaction.status,
      transaction
    };
  } catch (error) {
    console.error('Error getting transaction status:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get user payment history
const getUserPaymentHistory = async (userId, page = 1, limit = 20) => {
  try {
    const payments = await getCollection(PAYMENTS, [
      ['userId', '==', userId]
    ]);

    // Sort by date (newest first)
    payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPayments = payments.slice(startIndex, endIndex);

    return {
      success: true,
      payments: paginatedPayments,
      pagination: {
        page,
        limit,
        total: payments.length,
        totalPages: Math.ceil(payments.length / limit)
      }
    };
  } catch (error) {
    console.error('Error getting payment history:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get user subscription
const getUserSubscription = async (userId) => {
  try {
    const subscriptions = await getCollection(SUBSCRIPTIONS, [
      ['userId', '==', userId],
      ['status', '==', 'active']
    ]);

    if (subscriptions.length > 0) {
      const subscription = subscriptions[0];
      const planConfig = PLANS[subscription.plan];
      
      return {
        success: true,
        subscription: {
          ...subscription,
          planName: planConfig.name,
          planFeatures: planConfig.features,
          renewalDate: subscription.currentPeriodEnd
        }
      };
    }

    return {
      success: true,
      subscription: null
    };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Cancel subscription
const cancelSubscription = async (userId) => {
  try {
    const subscriptions = await getCollection(SUBSCRIPTIONS, [
      ['userId', '==', userId],
      ['status', '==', 'active']
    ]);

    if (subscriptions.length === 0) {
      return {
        success: false,
        error: 'No active subscription found'
      };
    }

    const subscription = subscriptions[0];

    // Update subscription to cancel at period end
    await updateDoc(SUBSCRIPTIONS, subscription.id, {
      cancelAtPeriodEnd: true,
      updatedAt: new Date().toISOString()
    });

    // Send cancellation confirmation email
    const user = await getDoc(USERS, userId);
    if (user && user.email) {
      await emailService.sendEmail({
        to: user.email,
        subject: 'Subscription Cancellation Confirmed',
        template: 'subscription_cancelled',
        data: {
          userName: `${user.firstName} ${user.lastName}`,
          planName: PLANS[subscription.plan].name,
          endDate: subscription.currentPeriodEnd
        }
      });
    }

    return {
      success: true,
      message: 'Subscription will be cancelled at the end of the current period'
    };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Upgrade user plan
const upgradePlan = async (userId, plan, paymentData) => {
  try {
    const user = await getDoc(USERS, userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update user subscription
    const subscriptionData = {
      userId,
      plan,
      status: 'active',
      paymentMethod: paymentData.paymentMethod,
      paymentId: paymentData.paymentId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days (Semester)
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Check if user has existing subscription
    const existingSubscriptions = await getCollection(SUBSCRIPTIONS, [
      ['userId', '==', userId],
      ['status', '==', 'active']
    ]);

    if (existingSubscriptions.length > 0) {
      // Update existing subscription
      await updateDoc(SUBSCRIPTIONS, existingSubscriptions[0].id, subscriptionData);
    } else {
      // Create new subscription
      await createDoc(SUBSCRIPTIONS, subscriptionData);
    }

    // Update user role
    const newRole = plan.includes('staff') ? 'staff' : 'student';
    await updateDoc(USERS, userId, {
      role: newRole,
      membership_status: 'premium',
      membership_expires_at: subscriptionData.currentPeriodEnd,
      subscriptionPlan: plan,
      updatedAt: new Date().toISOString()
    });


    // Award points for upgrade
    await incrementField(USER_POINTS, userId, 'points', 50);

    // Send confirmation email
    if (user.email) {
      await emailService.sendEmail({
        to: user.email,
        subject: 'Subscription Upgrade Successful',
        template: 'subscription_upgraded',
        data: {
          userName: `${user.firstName} ${user.lastName}`,
          planName: PLANS[plan].name,
          planFeatures: PLANS[plan].features,
          amount: paymentData.amount,
          currency: paymentData.currency
        }
      });
    }

    // Create notification
    await createDoc(NOTIFICATIONS, {
      userId,
      title: 'Subscription Upgraded',
      message: `You have successfully upgraded to the ${PLANS[plan].name} plan!`,
      type: 'subscription',
      read: false,
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Plan upgraded successfully'
    };
  } catch (error) {
    console.error('Error upgrading plan:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get exchange rate
const getExchangeRate = async (from, to) => {
  try {
    // In production, use real API like exchangerate-api.com
    const rates = {
      'UGX-USD': 0.00027,
      'USD-UGX': 3700,
      'EUR-USD': 1.08,
      'USD-EUR': 0.93,
      'GBP-USD': 1.27,
      'USD-GBP': 0.79
    };

    const key = `${from}-${to}`;
    const rate = rates[key];

    if (rate === undefined) {
      throw new Error('Exchange rate not available');
    }

    return {
      success: true,
      rate,
      from,
      to
    };
  } catch (error) {
    console.error('Error getting exchange rate:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper functions
const generateTransactionId = () => {
  return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const pollMTNStatus = async (transactionId, userId, plan) => {
  try {
    const maxAttempts = 24; // 2 minutes with 5-second intervals
    let attempts = 0;

    const poll = async () => {
      attempts++;
      
      // TODO: Implement actual polling if Flutterwave webhooks are not available
      // For now we rely on the webhook
    };

    setTimeout(poll, 5000); 
  } catch (error) {
    console.error('Error polling MTN status:', error);
  }
};

module.exports = {
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
};
