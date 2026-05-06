const { 
  getDoc, 
  getCollection, 
  createDoc, 
  updateDoc,
  deleteDoc,
  runTransaction
} = require('../utils/db.helpers');
const { 
  USERS, 
  POSTS, 
  EVENTS, 
  CLUBS, 
  REPORTS, 
  PAYMENTS, 
  SUBSCRIPTIONS,
  ADMIN_STATS,
  ANNOUNCEMENTS,
  USER_POINTS,
  TOKEN_DENYLIST,
  NOTIFICATIONS
} = require('../utils/collections');
const { 
  successResponse, 
  errorResponse 
} = require('../utils/response');
const { getIO } = require('../config/socket');
const { 
  createNotification,
  NOTIFICATION_TYPES 
} = require('../services/notification.service');
const { emailService } = require('../services/email.service');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

/**
 * Get admin dashboard statistics
 */
const getStats = async (req, res) => {
  try {
    // Get stats from aggregate document or calculate on-the-fly
    let stats = await getDoc(ADMIN_STATS, 'dashboard');
    
    if (!stats || !stats.lastUpdated || new Date(stats.lastUpdated) < new Date(Date.now() - 5 * 60 * 1000)) {
      // Calculate fresh stats if older than 5 minutes
      stats = await calculateDashboardStats();
      
      // Save to cache
      await updateDoc(ADMIN_STATS, 'dashboard', {
        ...stats,
        lastUpdated: new Date().toISOString()
      });
    }

    return successResponse(res, { stats });

  } catch (error) {
    console.error('Error getting admin stats:', error);
    return errorResponse(res, 'Failed to fetch dashboard statistics', 500);
  }
};

/**
 * Calculate dashboard statistics
 */
const calculateDashboardStats = async () => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    // Total users
    const totalUsers = await getCollection(USERS, []);
    
    // New users this week
    const newThisWeek = totalUsers.filter(user => 
      new Date(user.createdAt) > weekAgo
    ).length;

    // Active today (logged in today)
    const activeToday = totalUsers.filter(user => 
      user.lastLoginAt && new Date(user.lastLoginAt) > today
    ).length;

    // Total revenue from payments
    const payments = await getCollection(PAYMENTS, [
      ['status', '==', 'completed']
    ]);
    const totalRevenue = payments.reduce((sum, payment) => 
      sum + (payment.amount || 0), 0
    );

    // Pending posts
    const pendingPosts = await getCollection(POSTS, [
      ['status', '==', 'pending']
    ]).length;

    // Pending reports
    const pendingReports = await getCollection(REPORTS, [
      ['status', '==', 'pending']
    ]).length;

    // Total events and clubs
    const totalEvents = await getCollection(EVENTS, []).length;
    const totalClubs = await getCollection(CLUBS, []).length;

    return {
      totalUsers: totalUsers.length,
      newThisWeek,
      activeToday,
      totalRevenue,
      pendingPosts,
      pendingReports,
      totalEvents,
      totalClubs
    };

  } catch (error) {
    console.error('Error calculating dashboard stats:', error);
    return {
      totalUsers: 0,
      newThisWeek: 0,
      activeToday: 0,
      totalRevenue: 0,
      pendingPosts: 0,
      pendingReports: 0,
      totalEvents: 0,
      totalClubs: 0
    };
  }
};

/**
 * Get all users with filtering and pagination
 */
const getUsers = async (req, res) => {
  try {
    const { 
      search = '', 
      country, 
      university, 
      plan, 
      status, 
      page = 1, 
      limit = 50 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return errorResponse(res, 'Invalid pagination parameters', 400);
    }

    let users = await getCollection(USERS, []);

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user => 
        (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.username && user.username.toLowerCase().includes(searchLower))
      );
    }

    if (country) {
      users = users.filter(user => user.country === country);
    }

    if (university) {
      users = users.filter(user => user.university === university);
    }

    if (plan) {
      users = users.filter(user => user.subscriptionPlan === plan);
    }

    if (status) {
      users = users.filter(user => user.status === status);
    }

    // Get user points for each user
    const userIds = users.map(user => user.uid);
    const userPointsMap = new Map();
    
    if (userIds.length > 0) {
      const userPoints = await getCollection(USER_POINTS, [
        ['userId', 'in', userIds]
      ]);
      
      userPoints.forEach(point => {
        userPointsMap.set(point.userId, point.points || 0);
      });
    }

    // Format user data
    const formattedUsers = users.map(user => ({
      id: user.uid,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      email: user.email,
      username: user.username,
      country: user.country,
      university: user.university,
      plan: user.subscriptionPlan || 'free',
      status: user.status || 'active',
      role: user.role || 'member',
      joinDate: user.createdAt,
      lastLogin: user.lastLoginAt,
      points: userPointsMap.get(user.uid) || 0,
      avatar: user.avatar,
      verifiedStudent: user.verifiedStudent || false,
      verifiedEmail: user.verifiedEmail || false
    }));

    // Sort by join date (newest first)
    formattedUsers.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));

    // Apply pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedUsers = formattedUsers.slice(startIndex, endIndex);

    return successResponse(res, {
      users: paginatedUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: formattedUsers.length,
        totalPages: Math.ceil(formattedUsers.length / limitNum)
      }
    });

  } catch (error) {
    console.error('Error getting users:', error);
    return errorResponse(res, 'Failed to fetch users', 500);
  }
};

/**
 * Update user role
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['member', 'moderator', 'admin'].includes(role)) {
      return errorResponse(res, 'Invalid role. Must be member, moderator, or admin', 400);
    }

    const user = await getDoc(USERS, id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Prevent self-role modification
    if (id === req.user.id) {
      return errorResponse(res, 'Cannot modify your own role', 403);
    }

    await updateDoc(USERS, id, {
      role,
      updatedAt: new Date().toISOString()
    });

    // Log the action
    await createAdminLog(req.user.id, 'role_update', {
      targetUserId: id,
      oldRole: user.role,
      newRole: role
    });

    // Notify user
    await createNotification(id, {
      type: NOTIFICATION_TYPES.ANNOUNCEMENT,
      title: 'Role Updated',
      message: `Your role has been updated to ${role}`,
      metadata: { newRole: role },
      urgency: 'normal'
    });

    return successResponse(res, {
      message: 'User role updated successfully',
      user: {
        id,
        role
      }
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    return errorResponse(res, 'Failed to update user role', 500);
  }
};

/**
 * Suspend user
 */
const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, duration } = req.body;

    if (!reason || reason.trim().length === 0) {
      return errorResponse(res, 'Suspension reason is required', 400);
    }

    if (typeof duration !== 'number' || duration < 0) {
      return errorResponse(res, 'Duration must be a non-negative number', 400);
    }

    const user = await getDoc(USERS, id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Prevent self-suspension
    if (id === req.user.id) {
      return errorResponse(res, 'Cannot suspend yourself', 403);
    }

    // Calculate suspension end date
    let suspendedUntil = null;
    if (duration > 0) {
      suspendedUntil = new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString();
    }

    await updateDoc(USERS, id, {
      status: 'suspended',
      suspendedUntil,
      suspendReason: reason,
      suspendedBy: req.user.id,
      suspendedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Revoke user's tokens
    await revokeUserTokens(id);

    // Log the action
    await createAdminLog(req.user.id, 'user_suspend', {
      targetUserId: id,
      reason,
      duration,
      suspendedUntil
    });

    // Notify user
    await createNotification(id, {
      type: NOTIFICATION_TYPES.ANNOUNCEMENT,
      title: 'Account Suspended',
      message: `Your account has been suspended. Reason: ${reason}`,
      metadata: { reason, duration, suspendedUntil },
      urgency: 'high'
    });

    // Send email notification
    await emailService.sendEmail({
      to: user.email,
      subject: 'Account Suspension',
      template: 'notification',
      data: {
        userName: `${user.firstName} ${user.lastName}`,
        title: 'Account Suspended',
        message: `Your account has been suspended for the following reason: ${reason}. ${duration > 0 ? `Suspension will end on ${new Date(suspendedUntil).toLocaleDateString()}.` : 'This is a permanent suspension.'}`,
        urgency: 'high'
      }
    });

    // Force logout via Socket.io
    const io = getIO();
    io.emit('force_logout', { userId: id });

    return successResponse(res, {
      message: 'User suspended successfully',
      user: {
        id,
        status: 'suspended',
        suspendedUntil,
        reason
      }
    });

  } catch (error) {
    console.error('Error suspending user:', error);
    return errorResponse(res, 'Failed to suspend user', 500);
  }
};

/**
 * Unsuspend user
 */
const unsuspendUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await getDoc(USERS, id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (user.status !== 'suspended') {
      return errorResponse(res, 'User is not suspended', 400);
    }

    await updateDoc(USERS, id, {
      status: 'active',
      suspendedUntil: null,
      suspendReason: null,
      suspendedBy: null,
      suspendedAt: null,
      updatedAt: new Date().toISOString()
    });

    // Log the action
    await createAdminLog(req.user.id, 'user_unsuspend', {
      targetUserId: id
    });

    // Notify user
    await createNotification(id, {
      type: NOTIFICATION_TYPES.ANNOUNCEMENT,
      title: 'Account Unsuspended',
      message: 'Your account has been unsuspended. You can now access the platform.',
      metadata: {},
      urgency: 'normal'
    });

    // Send email notification
    await emailService.sendEmail({
      to: user.email,
      subject: 'Account Unsuspended',
      template: 'notification',
      data: {
        userName: `${user.firstName} ${user.lastName}`,
        title: 'Account Unsuspended',
        message: 'Your account has been unsuspended. You can now access the platform normally.',
        urgency: 'normal'
      }
    });

    return successResponse(res, {
      message: 'User unsuspended successfully',
      user: {
        id,
        status: 'active'
      }
    });

  } catch (error) {
    console.error('Error unsuspending user:', error);
    return errorResponse(res, 'Failed to unsuspend user', 500);
  }
};

/**
 * Get pending posts
 */
const getPendingPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
      return errorResponse(res, 'Invalid pagination parameters', 400);
    }

    const pendingPosts = await getCollection(POSTS, [
      ['status', '==', 'pending']
    ]);

    // Get author details for each post
    const authorIds = pendingPosts.map(post => post.author);
    const authors = await getCollection(USERS, [
      ['uid', 'in', authorIds]
    ]);

    const postsWithAuthors = pendingPosts.map(post => {
      const author = authors.find(a => a.uid === post.author);
      return {
        id: post.id,
        title: post.title,
        content: post.content.substring(0, 200) + '...',
        author: {
          id: post.author,
          name: author ? `${author.firstName} ${author.lastName}` : 'Unknown',
          avatar: author?.avatar
        },
        createdAt: post.createdAt,
        category: post.category,
        likes: post.likes || 0,
        comments: post.comments || 0
      };
    });

    // Sort by creation date (oldest first)
    postsWithAuthors.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Apply pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedPosts = postsWithAuthors.slice(startIndex, endIndex);

    return successResponse(res, {
      posts: paginatedPosts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: postsWithAuthors.length,
        totalPages: Math.ceil(postsWithAuthors.length / limitNum)
      }
    });

  } catch (error) {
    console.error('Error getting pending posts:', error);
    return errorResponse(res, 'Failed to fetch pending posts', 500);
  }
};

/**
 * Approve post
 */
const approvePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await getDoc(POSTS, id);
    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }

    if (post.status !== 'pending') {
      return errorResponse(res, 'Post is not pending approval', 400);
    }

    await updateDoc(POSTS, id, {
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Log the action
    await createAdminLog(req.user.id, 'post_approve', {
      postId: id,
      postAuthor: post.author
    });

    // Notify post author
    await createNotification(post.author, {
      type: NOTIFICATION_TYPES.POST_COMMENTED,
      title: 'Post Approved',
      message: 'Your post has been approved and is now visible to all users.',
      metadata: { postId: id },
      urgency: 'normal'
    });

    return successResponse(res, {
      message: 'Post approved successfully',
      post: { id, status: 'approved' }
    });

  } catch (error) {
    console.error('Error approving post:', error);
    return errorResponse(res, 'Failed to approve post', 500);
  }
};

/**
 * Reject post
 */
const rejectPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return errorResponse(res, 'Rejection reason is required', 400);
    }

    const post = await getDoc(POSTS, id);
    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }

    if (post.status !== 'pending') {
      return errorResponse(res, 'Post is not pending approval', 400);
    }

    await updateDoc(POSTS, id, {
      status: 'rejected',
      rejectedBy: req.user.id,
      rejectedAt: new Date().toISOString(),
      rejectReason: reason,
      updatedAt: new Date().toISOString()
    });

    // Log the action
    await createAdminLog(req.user.id, 'post_reject', {
      postId: id,
      postAuthor: post.author,
      reason
    });

    // Notify post author
    await createNotification(post.author, {
      type: NOTIFICATION_TYPES.POST_COMMENTED,
      title: 'Post Rejected',
      message: `Your post was not approved. Reason: ${reason}`,
      metadata: { postId: id, reason },
      urgency: 'normal'
    });

    return successResponse(res, {
      message: 'Post rejected successfully',
      post: { id, status: 'rejected', reason }
    });

  } catch (error) {
    console.error('Error rejecting post:', error);
    return errorResponse(res, 'Failed to reject post', 500);
  }
};

/**
 * Get reports
 */
const getReports = async (req, res) => {
  try {
    const { status = 'pending', type, page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
      return errorResponse(res, 'Invalid pagination parameters', 400);
    }

    if (!['pending', 'resolved', 'dismissed'].includes(status)) {
      return errorResponse(res, 'Invalid status. Must be pending, resolved, or dismissed', 400);
    }

    let reports = await getCollection(REPORTS, [
      ['status', '==', status]
    ]);

    if (type) {
      reports = reports.filter(report => report.type === type);
    }

    // Get reporter and target user details
    const reporterIds = reports.map(r => r.reporterId).filter(Boolean);
    const targetIds = reports.map(r => r.targetId).filter(Boolean);
    
    const allUserIds = [...new Set([...reporterIds, ...targetIds])];
    const users = await getCollection(USERS, [
      ['uid', 'in', allUserIds]
    ]);

    const reportsWithDetails = reports.map(report => {
      const reporter = users.find(u => u.uid === report.reporterId);
      const target = users.find(u => u.uid === report.targetId);
      
      return {
        id: report.id,
        type: report.type,
        reason: report.reason,
        description: report.description,
        reporter: reporter ? {
          id: reporter.uid,
          name: `${reporter.firstName} ${reporter.lastName}`,
          avatar: reporter.avatar
        } : null,
        target: target ? {
          id: target.uid,
          name: `${target.firstName} ${target.lastName}`,
          avatar: target.avatar
        } : null,
        targetId: report.targetId,
        createdAt: report.createdAt,
        status: report.status,
        resolvedBy: report.resolvedBy,
        resolvedAt: report.resolvedAt,
        resolution: report.resolution
      };
    });

    // Sort by creation date (newest first)
    reportsWithDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedReports = reportsWithDetails.slice(startIndex, endIndex);

    return successResponse(res, {
      reports: paginatedReports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: reportsWithDetails.length,
        totalPages: Math.ceil(reportsWithDetails.length / limitNum)
      }
    });

  } catch (error) {
    console.error('Error getting reports:', error);
    return errorResponse(res, 'Failed to fetch reports', 500);
  }
};

/**
 * Resolve report
 */
const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, note } = req.body;

    if (!['dismiss', 'warn', 'remove', 'ban'].includes(action)) {
      return errorResponse(res, 'Invalid action. Must be dismiss, warn, remove, or ban', 400);
    }

    const report = await getDoc(REPORTS, id);
    if (!report) {
      return errorResponse(res, 'Report not found', 404);
    }

    if (report.status !== 'pending') {
      return errorResponse(res, 'Report is not pending', 400);
    }

    await updateDoc(REPORTS, id, {
      status: 'resolved',
      resolvedBy: req.user.id,
      resolvedAt: new Date().toISOString(),
      resolution: {
        action,
        note: note || ''
      },
      updatedAt: new Date().toISOString()
    });

    // Log the action
    await createAdminLog(req.user.id, 'report_resolve', {
      reportId: id,
      action,
      note,
      targetId: report.targetId
    });

    // Take action based on resolution
    if (action === 'warn' && report.targetId) {
      await createNotification(report.targetId, {
        type: NOTIFICATION_TYPES.ANNOUNCEMENT,
        title: 'Warning',
        message: `You have received a warning regarding: ${report.reason}`,
        metadata: { reportId: id, reason: report.reason },
        urgency: 'high'
      });
    } else if (action === 'remove' && report.targetId && report.type === 'post') {
      await deleteDoc(POSTS, report.targetId);
    } else if (action === 'ban' && report.targetId) {
      await suspendUserAction(report.targetId, 'Violation of community guidelines', 0);
    }

    return successResponse(res, {
      message: 'Report resolved successfully',
      report: { id, status: 'resolved', action }
    });

  } catch (error) {
    console.error('Error resolving report:', error);
    return errorResponse(res, 'Failed to resolve report', 500);
  }
};

/**
 * Get payments
 */
const getPayments = async (req, res) => {
  try {
    const { method, status, from, to, page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
      return errorResponse(res, 'Invalid pagination parameters', 400);
    }

    let payments = await getCollection(PAYMENTS, []);

    // Apply filters
    if (method) {
      payments = payments.filter(payment => payment.method === method);
    }

    if (status) {
      payments = payments.filter(payment => payment.status === status);
    }

    if (from) {
      const fromDate = new Date(from);
      payments = payments.filter(payment => 
        new Date(payment.createdAt) >= fromDate
      );
    }

    if (to) {
      const toDate = new Date(to);
      payments = payments.filter(payment => 
        new Date(payment.createdAt) <= toDate
      );
    }

    // Get user details for each payment
    const userIds = payments.map(payment => payment.userId).filter(Boolean);
    const users = await getCollection(USERS, [
      ['uid', 'in', userIds]
    ]);

    const paymentsWithUsers = payments.map(payment => {
      const user = users.find(u => u.uid === payment.userId);
      return {
        id: payment.id,
        userId: payment.userId,
        user: user ? {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email
        } : null,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        status: payment.status,
        plan: payment.plan,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt,
        transactionId: payment.transactionId
      };
    });

    // Sort by creation date (newest first)
    paymentsWithUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedPayments = paymentsWithUsers.slice(startIndex, endIndex);

    return successResponse(res, {
      payments: paginatedPayments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: paymentsWithUsers.length,
        totalPages: Math.ceil(paymentsWithUsers.length / limitNum)
      }
    });

  } catch (error) {
    console.error('Error getting payments:', error);
    return errorResponse(res, 'Failed to fetch payments', 500);
  }
};

/**
 * Export payments as CSV
 */
const exportPayments = async (req, res) => {
  try {
    const { method, status, from, to } = req.query;

    let payments = await getCollection(PAYMENTS, []);

    // Apply filters
    if (method) {
      payments = payments.filter(payment => payment.method === method);
    }

    if (status) {
      payments = payments.filter(payment => payment.status === status);
    }

    if (from) {
      const fromDate = new Date(from);
      payments = payments.filter(payment => 
        new Date(payment.createdAt) >= fromDate
      );
    }

    if (to) {
      const toDate = new Date(to);
      payments = payments.filter(payment => 
        new Date(payment.createdAt) <= toDate
      );
    }

    // Get user details
    const userIds = payments.map(payment => payment.userId).filter(Boolean);
    const users = await getCollection(USERS, [
      ['uid', 'in', userIds]
    ]);

    // Prepare CSV data
    const csvData = payments.map(payment => {
      const user = users.find(u => u.uid === payment.userId);
      return {
        'Payment ID': payment.id,
        'User Name': user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        'User Email': user ? user.email : 'Unknown',
        'Amount': payment.amount,
        'Currency': payment.currency,
        'Method': payment.method,
        'Status': payment.status,
        'Plan': payment.plan,
        'Transaction ID': payment.transactionId,
        'Created At': payment.createdAt,
        'Completed At': payment.completedAt || ''
      };
    });

    // Generate CSV
    const parser = new Parser();
    const csv = parser.parse(csvData);

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=payments_export_${new Date().toISOString().split('T')[0]}.csv`);
    
    res.send(csv);

  } catch (error) {
    console.error('Error exporting payments:', error);
    return errorResponse(res, 'Failed to export payments', 500);
  }
};

/**
 * Verify university
 */
const verifyUniversity = async (req, res) => {
  try {
    const { id } = req.params;

    const university = await getDoc('universities', id);
    if (!university) {
      return errorResponse(res, 'University not found', 404);
    }

    await updateDoc('universities', id, {
      verified: true,
      verifiedBy: req.user.id,
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Assign university admin role to contact user if exists
    if (university.contactUserId) {
      await updateDoc(USERS, university.contactUserId, {
        role: 'university_admin',
        universityId: id,
        updatedAt: new Date().toISOString()
      });

      // Notify the user
      await createNotification(university.contactUserId, {
        type: NOTIFICATION_TYPES.ANNOUNCEMENT,
        title: 'University Verified',
        message: `Your university ${university.name} has been verified. You now have university admin privileges.`,
        metadata: { universityId: id },
        urgency: 'high'
      });
    }

    // Log the action
    await createAdminLog(req.user.id, 'university_verify', {
      universityId: id,
      universityName: university.name
    });

    return successResponse(res, {
      message: 'University verified successfully',
      university: { id, verified: true }
    });

  } catch (error) {
    console.error('Error verifying university:', error);
    return errorResponse(res, 'Failed to verify university', 500);
  }
};

/**
 * Create announcement
 */
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, target = 'all', urgent = false } = req.body;

    if (!title || title.trim().length === 0) {
      return errorResponse(res, 'Announcement title is required', 400);
    }

    if (!content || content.trim().length === 0) {
      return errorResponse(res, 'Announcement content is required', 400);
    }

    if (!['all', 'university'].includes(target)) {
      return errorResponse(res, 'Invalid target. Must be all or university', 400);
    }

    if (target === 'university' && !req.body.universityId) {
      return errorResponse(res, 'University ID is required for university-targeted announcements', 400);
    }

    // Create announcement post
    const announcementId = require('uuid').v4();
    await createDoc(ANNOUNCEMENTS, announcementId, {
      id: announcementId,
      title,
      content,
      target,
      universityId: req.body.universityId || null,
      urgent,
      author: req.user.id,
      status: 'approved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Send bulk notification
    let targetUsers = [];
    
    if (target === 'all') {
      const allUsers = await getCollection(USERS, [
        ['status', '==', 'active']
      ]);
      targetUsers = allUsers.map(user => user.uid);
    } else if (target === 'university' && req.body.universityId) {
      const universityUsers = await getCollection(USERS, [
        ['university', '==', req.body.universityId],
        ['status', '==', 'active']
      ]);
      targetUsers = universityUsers.map(user => user.uid);
    }

    if (targetUsers.length > 0) {
      const { sendBulkNotification } = require('../services/notification.service');
      await sendBulkNotification(targetUsers, {
        type: NOTIFICATION_TYPES.ANNOUNCEMENT,
        title,
        message: content.substring(0, 200) + '...',
        metadata: { announcementId, urgent },
        urgency: urgent ? 'high' : 'normal'
      });
    }

    // Log the action
    await createAdminLog(req.user.id, 'announcement_create', {
      announcementId,
      title,
      target,
      urgent,
      targetUserCount: targetUsers.length
    });

    return successResponse(res, {
      message: 'Announcement created successfully',
      announcement: {
        id: announcementId,
        title,
        target,
        urgent,
        notifiedUsers: targetUsers.length
      }
    });

  } catch (error) {
    console.error('Error creating announcement:', error);
    return errorResponse(res, 'Failed to create announcement', 500);
  }
};

/**
 * Get analytics
 */
const getAnalytics = async (req, res) => {
  try {
    const { from, to } = req.query;

    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();

    // Signups per day
    const signupsPerDay = await calculateSignupsPerDay(fromDate, toDate);

    // Posts per category
    const postsPerCategory = await calculatePostsPerCategory(fromDate, toDate);

    // Revenue breakdown
    const revenueBreakdown = await calculateRevenueBreakdown(fromDate, toDate);

    // Active users
    const activeUsers = await calculateActiveUsers(fromDate, toDate);

    // Top universities
    const topUniversities = await calculateTopUniversities();

    return successResponse(res, {
      analytics: {
        period: { from: fromDate.toISOString(), to: toDate.toISOString() },
        signupsPerDay,
        postsPerCategory,
        revenueBreakdown,
        activeUsers,
        topUniversities
      }
    });

  } catch (error) {
    console.error('Error getting analytics:', error);
    return errorResponse(res, 'Failed to fetch analytics', 500);
  }
};

/**
 * Helper functions
 */
const createAdminLog = async (adminId, action, details) => {
  try {
    const logId = require('uuid').v4();
    await createDoc('admin_logs', logId, {
      id: logId,
      adminId,
      action,
      details,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating admin log:', error);
  }
};

const revokeUserTokens = async (userId) => {
  try {
    // Add current tokens to denylist
    const userTokens = await getCollection(TOKEN_DENYLIST, [
      ['userId', '==', userId]
    ]);
    
    for (const token of userTokens) {
      await createDoc(TOKEN_DENYLIST, token.token, {
        token: token.token,
        userId,
        revokedAt: new Date().toISOString(),
        reason: 'User suspension'
      });
    }
  } catch (error) {
    console.error('Error revoking user tokens:', error);
  }
};

const suspendUserAction = async (userId, reason, duration) => {
  try {
    const suspendedUntil = duration > 0 ? 
      new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString() : null;

    await updateDoc(USERS, userId, {
      status: 'suspended',
      suspendedUntil,
      suspendReason: reason,
      suspendedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error suspending user:', error);
  }
};

const calculateSignupsPerDay = async (fromDate, toDate) => {
  try {
    const users = await getCollection(USERS, []);
    const filteredUsers = users.filter(user => {
      const createdAt = new Date(user.createdAt);
      return createdAt >= fromDate && createdAt <= toDate;
    });

    const signupsByDay = {};
    filteredUsers.forEach(user => {
      const day = new Date(user.createdAt).toISOString().split('T')[0];
      signupsByDay[day] = (signupsByDay[day] || 0) + 1;
    });

    return Object.entries(signupsByDay).map(([date, count]) => ({ date, count }));
  } catch (error) {
    console.error('Error calculating signups per day:', error);
    return [];
  }
};

const calculatePostsPerCategory = async (fromDate, toDate) => {
  try {
    const posts = await getCollection(POSTS, []);
    const filteredPosts = posts.filter(post => {
      const createdAt = new Date(post.createdAt);
      return createdAt >= fromDate && createdAt <= toDate;
    });

    const postsByCategory = {};
    filteredPosts.forEach(post => {
      const category = post.category || 'other';
      postsByCategory[category] = (postsByCategory[category] || 0) + 1;
    });

    return Object.entries(postsByCategory).map(([category, count]) => ({ category, count }));
  } catch (error) {
    console.error('Error calculating posts per category:', error);
    return [];
  }
};

const calculateRevenueBreakdown = async (fromDate, toDate) => {
  try {
    const payments = await getCollection(PAYMENTS, [
      ['status', '==', 'completed']
    ]);
    
    const filteredPayments = payments.filter(payment => {
      const completedAt = new Date(payment.completedAt || payment.createdAt);
      return completedAt >= fromDate && completedAt <= toDate;
    });

    const revenueByMethod = {};
    const revenueByPlan = {};

    filteredPayments.forEach(payment => {
      const method = payment.method || 'other';
      const plan = payment.plan || 'other';
      
      revenueByMethod[method] = (revenueByMethod[method] || 0) + (payment.amount || 0);
      revenueByPlan[plan] = (revenueByPlan[plan] || 0) + (payment.amount || 0);
    });

    return {
      byMethod: Object.entries(revenueByMethod).map(([method, amount]) => ({ method, amount })),
      byPlan: Object.entries(revenueByPlan).map(([plan, amount]) => ({ plan, amount }))
    };
  } catch (error) {
    console.error('Error calculating revenue breakdown:', error);
    return { byMethod: [], byPlan: [] };
  }
};

const calculateActiveUsers = async (fromDate, toDate) => {
  try {
    const users = await getCollection(USERS, []);
    const activeUsers = users.filter(user => {
      const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt) : null;
      return lastLogin && lastLogin >= fromDate && lastLogin <= toDate;
    });

    return {
      total: activeUsers.length,
      percentage: users.length > 0 ? Math.round((activeUsers.length / users.length) * 100) : 0
    };
  } catch (error) {
    console.error('Error calculating active users:', error);
    return { total: 0, percentage: 0 };
  }
};

const calculateTopUniversities = async () => {
  try {
    const users = await getCollection(USERS, []);
    const universities = {};

    users.forEach(user => {
      if (user.university) {
        universities[user.university] = (universities[user.university] || 0) + 1;
      }
    });

    return Object.entries(universities)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([university, count]) => ({ university, count }));
  } catch (error) {
    console.error('Error calculating top universities:', error);
    return [];
  }
};

module.exports = {
  getStats,
  getUsers,
  updateUserRole,
  suspendUser,
  unsuspendUser,
  getPendingPosts,
  approvePost,
  rejectPost,
  getReports,
  resolveReport,
  getPayments,
  exportPayments,
  verifyUniversity,
  createAnnouncement,
  getAnalytics
};
