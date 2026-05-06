const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting for public endpoints
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
      retry_after: 900
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for API key endpoints
const apiKeyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each API key to 100 requests per hour
  keyGenerator: (req) => req.get('X-API-Key') || req.ip,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Limit: 100/hour.',
      retry_after: 3600
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Mock data (in production, this would come from a database)
const mockData = {
  events: [
    {
      id: '1',
      title: 'Career Fair 2024',
      description: 'Annual career fair with top companies',
      date: '2024-05-15',
      time: '10:00',
      location: 'Main Campus',
      university: 'bugema',
      category: 'career',
      attendees: 250,
      image: 'https://example.com/career-fair.jpg'
    },
    {
      id: '2',
      title: 'Tech Talk: AI in Education',
      description: 'Exploring the role of AI in modern education',
      date: '2024-05-20',
      time: '14:00',
      location: 'Lecture Hall A',
      university: 'bugema',
      category: 'academic',
      attendees: 150,
      image: 'https://example.com/tech-talk.jpg'
    }
  ],
  
  clubs: [
    {
      id: '1',
      name: 'Computer Science Club',
      description: 'For students interested in technology and programming',
      category: 'academic',
      members: 45,
      university: 'bugema',
      founded: '2020',
      logo: 'https://example.com/cs-club.jpg'
    },
    {
      id: '2',
      name: 'Sports Club',
      description: 'Promoting sports and physical fitness',
      category: 'sports',
      members: 80,
      university: 'bugema',
      founded: '2019',
      logo: 'https://example.com/sports-club.jpg'
    }
  ],
  
  universities: [
    {
      id: '1',
      name: 'Bugema University',
      slug: 'bugema',
      description: 'A leading university in Uganda',
      location: 'Kampala, Uganda',
      founded: '1997',
      students: 5000,
      website: 'https://bugema.ac.ug',
      logo: 'https://example.com/bugema-logo.jpg',
      type: 'university'
    },
    {
      id: '2',
      name: 'Makerere University',
      slug: 'makerere',
      description: 'Uganda\'s oldest and largest university',
      location: 'Kampala, Uganda',
      founded: '1922',
      students: 40000,
      website: 'https://mak.ac.ug',
      logo: 'https://example.com/mak-logo.jpg',
      type: 'university'
    }
  ],
  
  jobs: [
    {
      id: '1',
      title: 'Software Developer Intern',
      company: 'Tech Corp',
      type: 'internship',
      location: 'Kampala, Uganda',
      country: 'UG',
      description: 'Looking for motivated software developer interns',
      requirements: ['JavaScript', 'React', 'Node.js'],
      salary: 'UGX 500,000',
      posted: '2024-04-01',
      deadline: '2024-05-01'
    },
    {
      id: '2',
      title: 'Marketing Assistant',
      company: 'Marketing Pro',
      type: 'full-time',
      location: 'Entebbe, Uganda',
      country: 'UG',
      description: 'Join our marketing team',
      requirements: ['Marketing', 'Communication', 'Social Media'],
      salary: 'UGX 800,000',
      posted: '2024-04-05',
      deadline: '2024-05-15'
    }
  ],
  
  posts: [
    {
      id: '1',
      title: 'New Library Opening',
      content: 'We are excited to announce the opening of our new library facility...',
      category: 'news',
      author: 'Admin',
      date: '2024-04-10',
      likes: 45,
      comments: 12,
      university: 'bugema'
    },
    {
      id: '2',
      title: 'Student Achievement Awards',
      content: 'Congratulations to our students who excelled in various competitions...',
      category: 'announcements',
      author: 'Dean',
      date: '2024-04-08',
      likes: 89,
      comments: 23,
      university: 'bugema'
    }
  ],
  
  apiKeys: new Map(), // In production, use a proper database
  developerRegistrations: new Map(),
  leaderboard: [
    { userId: '1', name: 'John Doe', score: 1250, posts: 45, rank: 1 },
    { userId: '2', name: 'Jane Smith', score: 1180, posts: 38, rank: 2 },
    { userId: '3', name: 'Bob Johnson', score: 950, posts: 32, rank: 3 }
  ]
};

// Helper functions
const createResponse = (success, data = null, meta = null, error = null) => {
  const response = { success };
  
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  if (error !== null) response.error = error;
  
  return response;
};

const createError = (code, message, retryAfter = null) => {
  return createResponse(false, null, null, {
    code,
    message,
    ...(retryAfter && { retry_after: retryAfter })
  });
};

const validateApiKey = (req, res, next) => {
  const apiKey = req.get('X-API-Key');
  
  if (!apiKey) {
    return res.status(401).json(createError('MISSING_API_KEY', 'API key is required for this endpoint'));
  }
  
  const keyData = mockData.apiKeys.get(apiKey);
  
  if (!keyData || !keyData.isActive) {
    return res.status(401).json(createError('INVALID_API_KEY', 'Invalid or inactive API key'));
  }
  
  req.apiKey = keyData;
  next();
};

// Public endpoints (no authentication required)
app.get('/api/v1/events', publicLimiter, (req, res) => {
  /**
   * Get events with optional filtering
   * @route GET /api/v1/events
   * @param {string} university - Filter by university
   * @param {number} limit - Limit number of results (default: 10)
   * @param {number} page - Page number (default: 1)
   * @returns {Array} List of events
   */
  try {
    const { university, limit = 10, page = 1 } = req.query;
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    
    let filteredEvents = mockData.events;
    
    if (university) {
      filteredEvents = filteredEvents.filter(event => event.university === university);
    }
    
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);
    
    res.json(createResponse(true, paginatedEvents, {
      total: filteredEvents.length,
      page: pageNum,
      limit: limitNum,
      university: university || 'all'
    }));
  } catch (error) {
    res.status(500).json(createError('INTERNAL_ERROR', 'Internal server error'));
  }
});

app.get('/api/v1/events/:id', publicLimiter, (req, res) => {
  /**
   * Get event by ID
   * @route GET /api/v1/events/:id
   * @param {string} id - Event ID
   * @returns {Object} Event details
   */
  try {
    const { id } = req.params;
    const event = mockData.events.find(e => e.id === id);
    
    if (!event) {
      return res.status(404).json(createError('NOT_FOUND', 'Event not found'));
    }
    
    res.json(createResponse(true, event));
  } catch (error) {
    res.status(500).json(createError('INTERNAL_ERROR', 'Internal server error'));
  }
});

app.get('/api/v1/clubs', publicLimiter, (req, res) => {
  /**
   * Get clubs with optional filtering
   * @route GET /api/v1/clubs
   * @param {string} category - Filter by category
   * @param {number} limit - Limit number of results (default: 10)
   * @returns {Array} List of clubs
   */
  try {
    const { category, limit = 10 } = req.query;
    const limitNum = parseInt(limit);
    
    let filteredClubs = mockData.clubs;
    
    if (category) {
      filteredClubs = filteredClubs.filter(club => club.category === category);
    }
    
    const paginatedClubs = filteredClubs.slice(0, limitNum);
    
    res.json(createResponse(true, paginatedClubs, {
      total: filteredClubs.length,
      limit: limitNum,
      category: category || 'all'
    }));
  } catch (error) {
    res.status(500).json(createError('INTERNAL_ERROR', 'Internal server error'));
  }
});

app.get('/api/v1/universities', publicLimiter, (req, res) => {
  /**
   * Get all universities
   * @route GET /api/v1/universities
   * @returns {Array} List of universities
   */
  try {
    res.json(createResponse(true, mockData.universities, {
      total: mockData.universities.length
    }));
  } catch (error) {
    res.status(500).json(createError('INTERNAL_ERROR', 'Internal server error'));
  }
});

app.get('/api/v1/universities/:slug', publicLimiter, (req, res) => {
  /**
   * Get university by slug
   * @route GET /api/v1/universities/:slug
   * @param {string} slug - University slug
   * @returns {Object} University details
   */
  try {
    const { slug } = req.params;
    const university = mockData.universities.find(u => u.slug === slug);
    
    if (!university) {
      return res.status(404).json(createError('NOT_FOUND', 'University not found'));
    }
    
    res.json(createResponse(true, university));
  } catch (error) {
    res.status(500).json(createError('INTERNAL_ERROR', 'Internal server error'));
  }
});

app.get('/api/v1/jobs', publicLimiter, (req, res) => {
  /**
   * Get jobs with optional filtering
   * @route GET /api/v1/jobs
   * @param {string} type - Filter by job type (internship, full-time, part-time)
   * @param {string} country - Filter by country
   * @param {number} limit - Limit number of results (default: 10)
   * @returns {Array} List of jobs
   */
  try {
    const { type, country, limit = 10 } = req.query;
    const limitNum = parseInt(limit);
    
    let filteredJobs = mockData.jobs;
    
    if (type) {
      filteredJobs = filteredJobs.filter(job => job.type === type);
    }
    
    if (country) {
      filteredJobs = filteredJobs.filter(job => job.country === country);
    }
    
    const paginatedJobs = filteredJobs.slice(0, limitNum);
    
    res.json(createResponse(true, paginatedJobs, {
      total: filteredJobs.length,
      limit: limitNum,
      type: type || 'all',
      country: country || 'all'
    }));
  } catch (error) {
    res.status(500).json(createError('INTERNAL_ERROR', 'Internal server error'));
  }
});

app.get('/api/v1/posts', publicLimiter, (req, res) => {
  /**
   * Get posts with optional filtering
   * @route GET /api/v1/posts
   * @param {string} category - Filter by category
   * @param {number} limit - Limit number of results (default: 20)
   * @param {number} page - Page number (default: 1)
   * @returns {Array} List of posts
   */
  try {
    const { category, limit = 20, page = 1 } = req.query;
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    
    let filteredPosts = mockData.posts;
    
    if (category) {
      filteredPosts = filteredPosts.filter(post => post.category === category);
    }
    
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
    
    res.json(createResponse(true, paginatedPosts, {
      total: filteredPosts.length,
      page: pageNum,
      limit: limitNum,
      category: category || 'all'
    }));
  } catch (error) {
    res.status(500).json(createError('INTERNAL_ERROR', 'Internal server error'));
  }
});

// Protected endpoints (API key required)
app.get('/api/v1/members/count', apiKeyLimiter, validateApiKey, (req, res) => {
  /**
   * Get total member count
   * @route GET /api/v1/members/count
   * @requires {string} X-API-Key - Valid API key in header
   * @returns {Object} Member count statistics
   */
  try {
    // In production, this would query the database
    const memberStats = {
      total: 5000,
      active: 3200,
      new_this_month: 150,
      by_university: {
        bugema: 5000,
        makerere: 40000
      }
    };
    
    res.json(createResponse(true, memberStats));
  } catch (error) {
    res.status(500).json(createError('INTERNAL_ERROR', 'Internal server error'));
  }
});

app.get('/api/v1/leaderboard', apiKeyLimiter, validateApiKey, (req, res) => {
  /**
   * Get leaderboard with optional period filtering
   * @route GET /api/v1/leaderboard
   * @param {string} period - Filter by period (monthly, weekly, all-time)
   * @requires {string} X-API-Key - Valid API key in header
   * @returns {Array} Leaderboard data
   */
  try {
    const { period = 'all-time' } = req.query;
    
    // In production, this would query the database with period filtering
    let leaderboard = mockData.leaderboard;
    
    if (period === 'monthly') {
      // Mock monthly data
      leaderboard = leaderboard.map((user, index) => ({
        ...user,
        score: Math.floor(user.score * 0.3), // 30% of all-time score for monthly
        monthly_posts: Math.floor(Math.random() * 10) + 1
      }));
    }
    
    res.json(createResponse(true, leaderboard, {
      period,
      total: leaderboard.length,
      last_updated: new Date().toISOString()
    }));
  } catch (error) {
    res.status(500).json(createError('INTERNAL_ERROR', 'Internal server error'));
  }
});

// API key registration endpoint
app.post('/api/v1/developers/register', publicLimiter, (req, res) => {
  /**
   * Register for API key
   * @route POST /api/v1/developers/register
   * @param {Object} body - Registration data
   * @param {string} body.name - Developer name
   * @param {string} body.organisation - Organisation name
   * @param {string} body.use_case - Use case description
   * @returns {Object} Registration result with API key
   */
  try {
    const { name, organisation, use_case } = req.body;
    
    if (!name || !organisation || !use_case) {
      return res.status(400).json(createError('MISSING_FIELDS', 'Name, organisation, and use case are required'));
    }
    
    // Generate API key
    const apiKey = uuidv4();
    const registrationId = uuidv4();
    
    // Store registration (in production, use database)
    const registration = {
      id: registrationId,
      name,
      organisation,
      use_case,
      apiKey,
      createdAt: new Date().toISOString(),
      isActive: true,
      requestCount: 0,
      lastUsed: null
    };
    
    mockData.apiKeys.set(apiKey, registration);
    mockData.developerRegistrations.set(registrationId, registration);
    
    // In production, send email with API key
    
    res.status(201).json(createResponse(true, {
      registration_id: registrationId,
      api_key: apiKey,
      message: 'API key generated successfully. Check your email for the key.'
    }));
  } catch (error) {
    res.status(500).json(createError('INTERNAL_ERROR', 'Internal server error'));
  }
});

// API key management endpoints
app.get('/api/v1/developers/status', validateApiKey, (req, res) => {
  /**
   * Get API key status and usage statistics
   * @route GET /api/v1/developers/status
   * @requires {string} X-API-Key - Valid API key in header
   * @returns {Object} API key status
   */
  try {
    const apiKeyData = req.apiKey;
    
    res.json(createResponse(true, {
      api_key: apiKeyData.apiKey.substring(0, 8) + '...',
      name: apiKeyData.name,
      organisation: apiKeyData.organisation,
      created_at: apiKeyData.createdAt,
      last_used: apiKeyData.lastUsed,
      request_count: apiKeyData.requestCount,
      is_active: apiKeyData.isActive,
      rate_limit: {
        limit: 100,
        window: '1 hour',
        remaining: 100 - apiKeyData.requestCount
      }
    }));
  } catch (error) {
    res.status(500).json(createError('INTERNAL_ERROR', 'Internal server error'));
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(createError('INTERNAL_ERROR', 'Internal server error'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json(createError('NOT_FOUND', 'Endpoint not found'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Bugema Hub API server running on port ${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api/v1/docs`);
});

module.exports = app;
