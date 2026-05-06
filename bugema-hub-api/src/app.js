const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const { generalLimiter } = require('./middleware/rateLimit');

// Import routes
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const postsRoutes = require('./routes/posts.routes');
const eventsRoutes = require('./routes/events.routes');
const clubsRoutes = require('./routes/clubs.routes');
const marketplaceRoutes = require('./routes/marketplace.routes');
const jobsRoutes = require('./routes/jobs.routes');
const lostfoundRoutes = require('./routes/lostfound.routes');
const ridesRoutes = require('./routes/rides.routes');
const studygroupsRoutes = require('./routes/studygroups.routes');
const alumniRoutes = require('./routes/alumni.routes');
const universitiesRoutes = require('./routes/universities.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const resourcesRoutes = require('./routes/resources.routes');
const paymentsRoutes = require('./routes/payments.routes');
const adminRoutes = require('./routes/admin.routes');
const apiRoutes = require('./routes/api.routes');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// General middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Rate limiting
app.use(generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.API_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// API root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bugema Hub API is running',
    data: {
      docs: '/api/v1/docs',
      health: '/health',
      version: process.env.API_VERSION || '1.0.0'
    }
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/posts', postsRoutes);
app.use('/api/v1/events', eventsRoutes);
app.use('/api/v1/clubs', clubsRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/jobs', jobsRoutes);
app.use('/api/v1/lostfound', lostfoundRoutes);
app.use('/api/v1/rides', ridesRoutes);
app.use('/api/v1/studygroups', studygroupsRoutes);
app.use('/api/v1/alumni', alumniRoutes);
app.use('/api/v1/universities', universitiesRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/resources', resourcesRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1', apiRoutes); // Public API endpoints

// API documentation endpoint
app.get('/api/v1/docs', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bugema Hub API Documentation',
    data: {
      title: 'Bugema Hub API',
      version: '1.0.0',
      description: 'REST API for Bugema Hub campus platform',
      baseUrl: `${req.protocol}://${req.get('host')}/api/v1`,
      endpoints: {
        authentication: '/auth',
        users: '/users',
        posts: '/posts',
        events: '/events',
        clubs: '/clubs',
        marketplace: '/marketplace',
        jobs: '/jobs',
        lostfound: '/lostfound',
        rides: '/rides',
        studygroups: '/studygroups',
        alumni: '/alumni',
        universities: '/universities',
        notifications: '/notifications',
        leaderboard: '/leaderboard',
        feedback: '/feedback',
        resources: '/resources',
        payments: '/payments',
        admin: '/admin',
        public: '/'
      },
      documentation: 'https://github.com/bugema-hub/api-docs'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    data: {
      availableEndpoints: [
        '/api/v1/auth',
        '/api/v1/users',
        '/api/v1/posts',
        '/api/v1/events',
        '/api/v1/clubs',
        '/api/v1/marketplace',
        '/api/v1/jobs',
        '/api/v1/lostfound',
        '/api/v1/rides',
        '/api/v1/studygroups',
        '/api/v1/alumni',
        '/api/v1/universities',
        '/api/v1/notifications',
        '/api/v1/leaderboard',
        '/api/v1/feedback',
        '/api/v1/resources',
        '/api/v1/payments',
        '/api/v1/admin',
        '/api/v1',
        '/',
        '/health',
        '/api/v1/docs'
      ]
    },
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestId = req.headers['x-request-id'] || 'unknown';
  
  // Log all errors with timestamp and request details
  console.error(`[${timestamp}] [${requestId}] ${req.method} ${req.originalUrl} - Error:`, {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user?.id || 'anonymous'
  });

  // Firestore errors - return 503 for service unavailable
  if (error.code && (error.code.startsWith('firestore/') || error.code.startsWith('firebase/'))) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database service temporarily unavailable',
        retry_after: 60
      },
      timestamp
    });
  }

  // Validation errors - return 400
  if (error.name === 'ValidationError' || error.code === 'VALIDATION_ERROR') {
    const errors = error.details || Object.values(error.errors || {}).map(err => ({
      field: err.path || err.field,
      message: err.message
    }));
    
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors
      },
      timestamp
    });
  }

  // JWT errors - return 401
  if (error.name === 'JsonWebTokenError' || error.code === 'INVALID_TOKEN') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token',
        retry_after: null
      },
      timestamp
    });
  }

  if (error.name === 'TokenExpiredError' || error.code === 'TOKEN_EXPIRED') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Authentication token expired',
        retry_after: null
      },
      timestamp
    });
  }

  // File upload errors - return 400
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'File size exceeds maximum limit',
        retry_after: null
      },
      timestamp
    });
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'TOO_MANY_FILES',
        message: 'Number of files exceeds maximum limit',
        retry_after: null
      },
      timestamp
    });
  }

  // Rate limiting errors - return 429
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: error.message || 'Too many requests',
        retry_after: error.retryAfter || 3600
      },
      timestamp
    });
  }

  // Authentication/Authorization errors - return 401/403
  if (error.code === 'AUTH_REQUIRED' || error.code === 'UNAUTHORIZED') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Authentication required',
        retry_after: null
      },
      timestamp
    });
  }

  if (error.code === 'FORBIDDEN') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
        retry_after: null
      },
      timestamp
    });
  }

  // Not found errors - return 404
  if (error.code === 'NOT_FOUND' || error.statusCode === 404) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: error.message || 'Resource not found',
        retry_after: null
      },
      timestamp
    });
  }

  // Conflict errors - return 409
  if (error.code === 'CONFLICT' || error.code === 'ALREADY_EXISTS') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: error.message || 'Resource already exists',
        retry_after: null
      },
      timestamp
    });
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode === 500 ? 'INTERNAL_ERROR' : 'UNKNOWN_ERROR',
      message: isProduction ? 'Internal server error' : (error.message || 'Something went wrong'),
      retry_after: statusCode === 500 ? 60 : null,
      ...(isProduction ? {} : { 
        stack: error.stack,
        details: error.details || null 
      })
    },
    timestamp
  });
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  // TODO: Close database connections
  // TODO: Close Socket.io connections
  // TODO: Close any other resources
  
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
