const { errorResponse } = require('../utils/response');

/**
 * Check if user has required role(s)
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return errorResponse(res, 'Insufficient permissions to access this resource', 403);
    }

    next();
  };
};

/**
 * Check if user is verified student
 */
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required', 401);
  }

  if (!req.user.verifiedStudent) {
    return errorResponse(res, 'Student verification required to access this resource', 403);
  }

  next();
};

/**
 * Check if user has required plan(s)
 */
const requirePlan = (...allowedPlans) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const userPlan = req.user.plan;
    
    if (!allowedPlans.includes(userPlan)) {
      return errorResponse(res, `This feature requires ${allowedPlans.join(' or ')} plan`, 403);
    }

    next();
  };
};

/**
 * Check if user owns the resource (by comparing user ID to resource owner ID)
 */
const requireOwnership = (resourceIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    // Get resource ID from request parameters, body, or query
    const resourceId = req.params[resourceIdField] || 
                       req.body[resourceIdField] || 
                       req.query[resourceIdField];

    if (!resourceId) {
      return errorResponse(res, 'Resource ID not found', 400);
    }

    // Check if user ID matches resource owner ID
    if (req.user.uid !== resourceId && req.user.id !== resourceId) {
      // Admin can access any resource
      if (req.user.role !== 'admin') {
        return errorResponse(res, 'You can only access your own resources', 403);
      }
    }

    next();
  };
};

/**
 * Check if user can moderate (admin or moderator)
 */
const requireModeration = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required', 401);
  }

  const userRole = req.user.role;
    
  if (!['admin', 'moderator'].includes(userRole)) {
    return errorResponse(res, 'Moderation privileges required', 403);
  }

  next();
};

/**
 * Check if user is admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required', 401);
  }

  if (req.user.role !== 'admin') {
    return errorResponse(res, 'Admin privileges required', 403);
  }

  next();
};

/**
 * Check if user has basic member access
 */
const requireMember = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required', 401);
  }

  // All authenticated users have member access by default
  next();
};

/**
 * Check if user has premium features access
 */
const requirePremium = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required', 401);
  }

  const userPlan = req.user.plan;
    
  if (!['premium', 'enterprise'].includes(userPlan)) {
    return errorResponse(res, 'This feature requires a premium plan', 403);
  }

  next();
};

/**
 * Check if user has enterprise features access
 */
const requireEnterprise = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required', 401);
  }

  if (req.user.plan !== 'enterprise') {
    return errorResponse(res, 'This feature requires an enterprise plan', 403);
  }

  next();
};

/**
 * Check if user is from the same university (for university-specific features)
 */
const requireSameUniversity = (universityIdField = 'universityId') => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const resourceUniversityId = req.params[universityIdField] || 
                               req.body[universityIdField] || 
                               req.query[universityIdField];

    if (!resourceUniversityId) {
      return errorResponse(res, 'University ID not found', 400);
    }

    // Check if user is from the same university
    if (req.user.university !== resourceUniversityId) {
      // Admin can access any university
      if (req.user.role !== 'admin') {
        return errorResponse(res, 'You can only access resources from your university', 403);
      }
    }

    next();
  };
};

/**
 * Check if user has sufficient points (for gamification features)
 */
const requireMinPoints = (minPoints) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    if (req.user.points < minPoints) {
      return errorResponse(res, `You need at least ${minPoints} points to access this feature`, 403);
    }

    next();
  };
};

// Legacy middleware for backward compatibility
const checkRole = requireRole;
const isAdmin = requireAdmin;
const isModerator = requireModeration;
const isMember = requireMember;

module.exports = {
  // Primary middleware
  requireRole,
  requireVerified,
  requirePlan,
  requireOwnership,
  requireModeration,
  requireAdmin,
  requireMember,
  requirePremium,
  requireEnterprise,
  requireSameUniversity,
  requireMinPoints,
  
  // Legacy middleware (for backward compatibility)
  checkRole,
  isAdmin,
  isModerator,
  isMember
};
