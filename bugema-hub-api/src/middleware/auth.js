const jwt = require('jsonwebtoken');
const { getDoc } = require('../utils/db.helpers');
const { USERS, TOKEN_DENYLIST } = require('../utils/collections');
const { errorResponse } = require('../utils/response');
const { auth } = require('../config/firebase');

/**
 * Verify JWT token and attach user to request
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access token is required', 401);
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is in denylist
    const denylistedToken = await getDoc(TOKEN_DENYLIST, token);
    if (denylistedToken) {
      return errorResponse(res, 'Invalid or expired token', 401);
    }
    
    // Get user from database
    let user = await getDoc(USERS, decoded.uid);
    
    // If user not found in Firestore, try to get from Firebase Auth and create basic profile
    if (!user || user.isDeleted) {
      try {
        const firebaseUser = await auth.getUser(decoded.uid);
        const { createDoc } = require('../utils/db.helpers');
        
        // Create basic user profile from Firebase Auth data
        user = await createDoc(USERS, {
          uid: decoded.uid,
          email: firebaseUser.email || decoded.email,
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          displayName: firebaseUser.displayName,
          profilePicture: firebaseUser.photoURL || null,
          role: 'member',
          plan: 'free',
          isVerified: true, // Firebase accounts are pre-verified
          verifiedStudent: false,
          points: 0,
          university: null,
          bio: null,
          socialLinks: {},
          preferences: {
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
            eventReminders: true,
            clubUpdates: true,
            jobAlerts: true
          },
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }, decoded.uid);
      } catch (firebaseError) {
        console.error('Firebase Auth lookup failed:', firebaseError);
        return errorResponse(res, 'User not found', 401);
      }
    }

    // Attach user to request (exclude sensitive data)
    req.user = {
      id: user.id,
      uid: user.uid,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || 'member',
      plan: user.plan || 'free',
      isVerified: user.isVerified !== false,
      verifiedStudent: user.verifiedStudent || false,
      points: user.points || 0,
      university: user.university,
      profilePicture: user.profilePicture,
      preferences: user.preferences
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token format', 401);
    } else if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token has expired', 401);
    }
    
    console.error('Token verification error:', error);
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is in denylist
    const denylistedToken = await getDoc(TOKEN_DENYLIST, token);
    if (denylistedToken) {
      req.user = null;
      return next();
    }
    
    // Get user from database
    const user = await getDoc(USERS, decoded.uid);
    
    if (!user || user.isDeleted) {
      req.user = null;
      return next();
    }

    // Attach user to request
    req.user = {
      id: user.id,
      uid: user.uid,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      plan: user.plan,
      isVerified: user.isVerified,
      verifiedStudent: user.verifiedStudent,
      points: user.points,
      university: user.university,
      profilePicture: user.profilePicture,
      preferences: user.preferences
    };

    next();
  } catch (error) {
    // Any error with optional auth, just continue without user
    req.user = null;
    next();
  }
};

/**
 * Verify API key token (for external API access)
 */
const verifyApiKey = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'API key is required', 401);
    }

    const apiKey = authHeader.substring(7);
    
    // Verify API key token
    const decoded = jwt.verify(apiKey, process.env.API_SECRET);
    
    // Attach API info to request
    req.apiKey = {
      id: decoded.id,
      name: decoded.name,
      permissions: decoded.permissions || []
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid API key format', 401);
    } else if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'API key has expired', 401);
    }
    
    console.error('API key verification error:', error);
    return errorResponse(res, 'Invalid or expired API key', 401);
  }
};

module.exports = {
  verifyToken,
  optionalAuth,
  verifyApiKey
};
