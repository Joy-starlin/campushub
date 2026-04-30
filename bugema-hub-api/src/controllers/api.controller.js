const { 
  getDoc, 
  getCollection, 
  createDoc 
} = require('../utils/db.helpers');
const { 
  EVENTS, 
  CLUBS, 
  UNIVERSITIES, 
  MARKETPLACE, 
  JOBS,
  API_KEYS 
} = require('../utils/collections');
const { emailService } = require('../services/email.service');
const { v4: uuidv4 } = require('uuid');

/**
 * Standard API response format
 */
const createApiResponse = (success, data = null, meta = null, error = null) => {
  const response = { success };
  
  if (data !== null) {
    response.data = data;
  }
  
  if (meta !== null) {
    response.meta = meta;
  }
  
  if (error !== null) {
    response.error = error;
  }
  
  return response;
};

/**
 * Create pagination metadata
 */
const createPaginationMeta = (page, limit, total) => {
  return {
    total,
    page,
    limit,
    hasMore: page * limit < total,
    totalPages: Math.ceil(total / limit)
  };
};

/**
 * GET /api/v1/events
 */
const getEvents = async (req, res) => {
  try {
    const { university, limit = 10, page = 1 } = req.query;
    
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    
    if (limitNum < 1 || limitNum > 50) {
      return res.status(400).json(createApiResponse(false, null, null, {
        code: 'INVALID_LIMIT',
        message: 'Limit must be between 1 and 50',
        retry_after: null
      }));
    }
    
    if (pageNum < 1) {
      return res.status(400).json(createApiResponse(false, null, null, {
        code: 'INVALID_PAGE',
        message: 'Page must be greater than 0',
        retry_after: null
      }));
    }

    // Get public events only
    let events = await getCollection(EVENTS, [
      ['isPublic', '==', true],
      ['status', '==', 'approved']
    ]);

    // Filter by university if specified
    if (university) {
      events = events.filter(event => event.university === university);
    }

    // Filter out past events
    const now = new Date();
    events = events.filter(event => new Date(event.date) >= now);

    // Sort by date (upcoming first)
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Apply pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedEvents = events.slice(startIndex, endIndex);

    // Format event data for public API
    const formattedEvents = paginatedEvents.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      university: event.university,
      category: event.category,
      imageUrl: event.imageUrl,
      maxAttendees: event.maxAttendees,
      currentAttendees: event.attendees?.length || 0,
      tags: event.tags || []
    }));

    const meta = createPaginationMeta(pageNum, limitNum, events.length);

    return res.status(200).json(createApiResponse(true, formattedEvents, meta));

  } catch (error) {
    console.error('Error getting events:', error);
    return res.status(500).json(createApiResponse(false, null, null, {
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch events',
      retry_after: null
    }));
  }
};

/**
 * GET /api/v1/events/:id
 */
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await getDoc(EVENTS, id);
    
    if (!event) {
      return res.status(404).json(createApiResponse(false, null, null, {
        code: 'EVENT_NOT_FOUND',
        message: 'Event not found',
        retry_after: null
      }));
    }

    // Check if event is public and approved
    if (!event.isPublic || event.status !== 'approved') {
      return res.status(404).json(createApiResponse(false, null, null, {
        code: 'EVENT_NOT_PUBLIC',
        message: 'Event not available',
        retry_after: null
      }));
    }

    // Format event data
    const formattedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      university: event.university,
      category: event.category,
      imageUrl: event.imageUrl,
      maxAttendees: event.maxAttendees,
      currentAttendees: event.attendees?.length || 0,
      tags: event.tags || [],
      createdAt: event.createdAt,
      organizer: event.organizer
    };

    return res.status(200).json(createApiResponse(true, formattedEvent));

  } catch (error) {
    console.error('Error getting event by ID:', error);
    return res.status(500).json(createApiResponse(false, null, null, {
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch event',
      retry_after: null
    }));
  }
};

/**
 * GET /api/v1/clubs
 */
const getClubs = async (req, res) => {
  try {
    const { category, university, limit = 20, page = 1 } = req.query;
    
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    
    if (limitNum < 1 || limitNum > 50) {
      return res.status(400).json(createApiResponse(false, null, null, {
        code: 'INVALID_LIMIT',
        message: 'Limit must be between 1 and 50',
        retry_after: null
      }));
    }

    // Get public clubs only
    let clubs = await getCollection(CLUBS, [
      ['isPublic', '==', true],
      ['status', '==', 'approved']
    ]);

    // Apply filters
    if (category) {
      clubs = clubs.filter(club => club.category === category);
    }

    if (university) {
      clubs = clubs.filter(club => club.university === university);
    }

    // Sort by member count (most popular first)
    clubs.sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0));

    // Apply pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedClubs = clubs.slice(startIndex, endIndex);

    // Format club data for public API
    const formattedClubs = paginatedClubs.map(club => ({
      id: club.id,
      name: club.name,
      description: club.description,
      category: club.category,
      university: club.university,
      imageUrl: club.imageUrl,
      memberCount: club.members?.length || 0,
      maxMembers: club.maxMembers,
      tags: club.tags || [],
      createdAt: club.createdAt
    }));

    const meta = createPaginationMeta(pageNum, limitNum, clubs.length);

    return res.status(200).json(createApiResponse(true, formattedClubs, meta));

  } catch (error) {
    console.error('Error getting clubs:', error);
    return res.status(500).json(createApiResponse(false, null, null, {
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch clubs',
      retry_after: null
    }));
  }
};

/**
 * GET /api/v1/universities
 */
const getUniversities = async (req, res) => {
  try {
    const universities = await getCollection(UNIVERSITIES, [
      ['verified', '==', true]
    ]);

    // Sort by name
    universities.sort((a, b) => a.name.localeCompare(b.name));

    // Format university data for public API
    const formattedUniversities = universities.map(university => ({
      id: university.id,
      name: university.name,
      slug: university.slug,
      description: university.description,
      location: university.location,
      country: university.country,
      website: university.website,
      logo: university.logo,
      verified: university.verified,
      studentCount: university.studentCount || 0
    }));

    return res.status(200).json(createApiResponse(true, formattedUniversities));

  } catch (error) {
    console.error('Error getting universities:', error);
    return res.status(500).json(createApiResponse(false, null, null, {
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch universities',
      retry_after: null
    }));
  }
};

/**
 * GET /api/v1/universities/:slug
 */
const getUniversityBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const universities = await getCollection(UNIVERSITIES, [
      ['slug', '==', slug]
    ]);

    if (universities.length === 0) {
      return res.status(404).json(createApiResponse(false, null, null, {
        code: 'UNIVERSITY_NOT_FOUND',
        message: 'University not found',
        retry_after: null
      }));
    }

    const university = universities[0];

    // Format university data
    const formattedUniversity = {
      id: university.id,
      name: university.name,
      slug: university.slug,
      description: university.description,
      location: university.location,
      country: university.country,
      website: university.website,
      logo: university.logo,
      verified: university.verified,
      studentCount: university.studentCount || 0,
      founded: university.founded,
      type: university.type,
      programs: university.programs || []
    };

    return res.status(200).json(createApiResponse(true, formattedUniversity));

  } catch (error) {
    console.error('Error getting university by slug:', error);
    return res.status(500).json(createApiResponse(false, null, null, {
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch university',
      retry_after: null
    }));
  }
};

/**
 * GET /api/v1/jobs
 */
const getJobs = async (req, res) => {
  try {
    const { type, country, limit = 20, page = 1 } = req.query;
    
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    
    if (limitNum < 1 || limitNum > 50) {
      return res.status(400).json(createApiResponse(false, null, null, {
        code: 'INVALID_LIMIT',
        message: 'Limit must be between 1 and 50',
        retry_after: null
      }));
    }

    // Get active jobs only
    let jobs = await getCollection(JOBS, [
      ['status', '==', 'active'],
      ['expiresAt', '>', new Date().toISOString()]
    ]);

    // Apply filters
    if (type) {
      jobs = jobs.filter(job => job.type === type);
    }

    if (country) {
      jobs = jobs.filter(job => job.country === country);
    }

    // Sort by posted date (newest first)
    jobs.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));

    // Apply pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedJobs = jobs.slice(startIndex, endIndex);

    // Format job data for public API
    const formattedJobs = paginatedJobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      type: job.type,
      company: job.company,
      location: job.location,
      country: job.country,
      remote: job.remote || false,
      salary: job.salary,
      requirements: job.requirements || [],
      postedAt: job.postedAt,
      expiresAt: job.expiresAt,
      applicationUrl: job.applicationUrl
    }));

    const meta = createPaginationMeta(pageNum, limitNum, jobs.length);

    return res.status(200).json(createApiResponse(true, formattedJobs, meta));

  } catch (error) {
    console.error('Error getting jobs:', error);
    return res.status(500).json(createApiResponse(false, null, null, {
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch jobs',
      retry_after: null
    }));
  }
};

/**
 * POST /api/v1/keys/register
 */
const registerApiKey = async (req, res) => {
  try {
    const { name, organisation, useCase, email } = req.body;

    // Validate required fields
    if (!name || !organisation || !useCase || !email) {
      return res.status(400).json(createApiResponse(false, null, null, {
        code: 'MISSING_FIELDS',
        message: 'All fields are required: name, organisation, useCase, email',
        retry_after: null
      }));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json(createApiResponse(false, null, null, {
        code: 'INVALID_EMAIL',
        message: 'Invalid email format',
        retry_after: null
      }));
    }

    // Generate API key
    const apiKey = uuidv4();
    const now = new Date().toISOString();

    // Store API key in Firestore
    await createDoc(API_KEYS, apiKey, {
      key: apiKey,
      name,
      organisation,
      useCase,
      email,
      createdAt: now,
      isActive: true,
      usageCount: 0,
      dailyLimit: 1000,
      lastUsed: null,
      expiresAt: null // No expiration by default
    });

    // Send API key via email
    try {
      await emailService.sendEmail({
        to: email,
        subject: 'Bugema Hub API Key Registration',
        template: 'notification',
        data: {
          userName: name,
          title: 'Your Bugema Hub API Key',
          message: `Thank you for registering for the Bugema Hub API. Your API key is: ${apiKey}\n\nPlease keep this key secure and do not share it publicly.`,
          urgency: 'normal'
        }
      });
    } catch (emailError) {
      console.error('Failed to send API key email:', emailError);
      // Continue even if email fails
    }

    // Log the registration
    console.log(`API key registered: ${apiKey} for ${organisation} (${email})`);

    return res.status(201).json(createApiResponse(true, {
      message: 'API key registered successfully. Check your email for the API key.',
      keyId: apiKey.substring(0, 8) + '...' // Show partial key for reference
    }));

  } catch (error) {
    console.error('Error registering API key:', error);
    return res.status(500).json(createApiResponse(false, null, null, {
      code: 'REGISTRATION_ERROR',
      message: 'Failed to register API key',
      retry_after: null
    }));
  }
};

/**
 * GET /api/v1/stats (public stats)
 */
const getPublicStats = async (req, res) => {
  try {
    // Get basic public statistics
    const [events, clubs, universities, jobs] = await Promise.all([
      getCollection(EVENTS, [['isPublic', '==', true]]),
      getCollection(CLUBS, [['isPublic', '==', true]]),
      getCollection(UNIVERSITIES, [['verified', '==', true]]),
      getCollection(JOBS, [['status', '==', 'active']])
    ]);

    const stats = {
      totalEvents: events.length,
      totalClubs: clubs.length,
      totalUniversities: universities.length,
      totalJobs: jobs.length,
      uptime: process.uptime() ? Math.floor(process.uptime() / 86400) + ' days' : 'Unknown'
    };

    return res.status(200).json(createApiResponse(true, stats));

  } catch (error) {
    console.error('Error getting public stats:', error);
    return res.status(500).json(createApiResponse(false, null, null, {
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch statistics',
      retry_after: null
    }));
  }
};

module.exports = {
  getEvents,
  getEventById,
  getClubs,
  getUniversities,
  getUniversityBySlug,
  getJobs,
  registerApiKey,
  getPublicStats
};
