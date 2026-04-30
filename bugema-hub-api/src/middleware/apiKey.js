const rateLimit = require('express-rate-limit');
const { 
  getDoc, 
  getCollection, 
  updateDoc 
} = require('../utils/db.helpers');
const { API_KEYS } = require('../utils/collections');

/**
 * API Key Authentication Middleware
 */
const authenticateApiKey = async (req, res, next) => {
  try {
    // Extract API key from header
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'API_KEY_REQUIRED',
          message: 'API key is required. Include X-API-Key header.',
          retry_after: null
        }
      });
    }

    // Look up API key in Firestore
    const apiKeyDoc = await getDoc(API_KEYS, apiKey);
    
    if (!apiKeyDoc) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'Invalid API key.',
          retry_after: null
        }
      });
    }

    const apiKeyData = apiKeyDoc;

    // Check if key is active
    if (!apiKeyData.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'API_KEY_INACTIVE',
          message: 'API key has been deactivated.',
          retry_after: null
        }
      });
    }

    // Check if key is expired
    if (apiKeyData.expiresAt && new Date(apiKeyData.expiresAt) < new Date()) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'API_KEY_EXPIRED',
          message: 'API key has expired.',
          retry_after: null
        }
      });
    }

    // Check daily usage limit
    await checkDailyLimit(apiKey, apiKeyData, req, res);

    // Attach API key data to request
    req.apiKeyData = apiKeyData;
    req.apiKey = apiKey;

    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error. Please try again.',
        retry_after: null
      }
    });
  }
};

/**
 * Check daily usage limit
 */
const checkDailyLimit = async (apiKey, apiKeyData, req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    
    // Get today's usage
    const todayUsage = await getCollection('api_key_usage', [
      ['apiKey', '==', apiKey],
      ['date', '==', today]
    ]);

    const usageCount = todayUsage.reduce((total, usage) => total + usage.count, 0);
    const dailyLimit = apiKeyData.dailyLimit || 1000;

    if (usageCount >= dailyLimit) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'DAILY_LIMIT_EXCEEDED',
          message: `Daily API limit exceeded. Limit: ${dailyLimit}/day.`,
          retry_after: 86400 // 24 hours in seconds
        }
      });
    }

    // Increment usage count
    await incrementUsage(apiKey, today);
  } catch (error) {
    console.error('Error checking daily limit:', error);
    // Don't block the request if usage tracking fails
  }
};

/**
 * Increment usage count
 */
const incrementUsage = async (apiKey, date) => {
  try {
    const usageId = `${apiKey}_${date}`;
    const existingUsage = await getDoc('api_key_usage', usageId);
    
    if (existingUsage) {
      await updateDoc('api_key_usage', usageId, {
        count: existingUsage.count + 1,
        lastUsed: new Date().toISOString()
      });
    } else {
      await require('../utils/db.helpers').createDoc('api_key_usage', usageId, {
        id: usageId,
        apiKey,
        date,
        count: 1,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      });
    }

    // Update API key usage count
    await updateDoc(API_KEYS, apiKey, {
      usageCount: (await getDoc(API_KEYS, apiKey)).usageCount + 1,
      lastUsed: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error incrementing usage:', error);
  }
};

/**
 * Rate limiting middleware (100 requests per hour per key)
 */
const createRateLimit = () => {
  return rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // 100 requests per hour
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Limit: 100/hour.',
        retry_after: 3600 // 1 hour in seconds
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.apiKey || req.ip,
    handler: (req, res) => {
      // Log rate limit exceeded
      console.log(`Rate limit exceeded for API key: ${req.apiKey}`);
    }
  });
};

/**
 * Combined middleware for API key auth and rate limiting
 */
const apiAuth = [authenticateApiKey, createRateLimit()];

module.exports = {
  authenticateApiKey,
  createRateLimit,
  apiAuth
};
