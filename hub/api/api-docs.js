/**
 * @fileoverview Bugema Hub Public REST API Documentation
 * @version 1.0.0
 * @author Bugema Hub Team
 * @description This document provides comprehensive documentation for the Bugema Hub REST API, including endpoints, authentication, rate limiting, and code examples.
 */

/**
 * @namespace BugemaHubAPI
 * @description Main API namespace for Bugema Hub REST API
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Indicates if the request was successful
 * @property {any} data - The response data (if successful)
 * @property {Object} meta - Metadata about the response
 * @property {Object} error - Error information (if unsuccessful)
 * @property {number} total - Total number of items (in meta)
 * @property {number} page - Current page number (in meta)
 * @property {number} limit - Number of items per page (in meta)
 * @property {string} code - Error code (in error)
 * @property {string} message - Error message (in error)
 * @property {number} retry_after - Seconds to wait before retrying (in error)
 */

/**
 * @typedef {Object} Event
 * @property {string} id - Unique event identifier
 * @property {string} title - Event title
 * @property {string} description - Event description
 * @property {string} date - Event date (YYYY-MM-DD)
 * @property {string} time - Event time (HH:MM)
 * @property {string} location - Event location
 * @property {string} university - University slug
 * @property {string} category - Event category
 * @property {number} attendees - Number of attendees
 * @property {string} image - Event image URL
 */

/**
 * @typedef {Object} Club
 * @property {string} id - Unique club identifier
 * @property {string} name - Club name
 * @property {string} description - Club description
 * @property {string} category - Club category
 * @property {number} members - Number of members
 * @property {string} university - University slug
 * @property {string} founded - Year founded
 * @property {string} logo - Club logo URL
 */

/**
 * @typedef {Object} University
 * @property {string} id - Unique university identifier
 * @property {string} name - University name
 * @property {string} slug - URL-friendly slug
 * @property {string} description - University description
 * @property {string} location - University location
 * @property {number} founded - Year founded
 * @property {number} students - Number of students
 * @property {string} website - University website
 * @property {string} logo - University logo URL
 * @property {string} type - Institution type
 */

/**
 * @typedef {Object} Job
 * @property {string} id - Unique job identifier
 * @property {string} title - Job title
 * @property {string} company - Company name
 * @property {string} type - Job type (internship, full-time, part-time)
 * @property {string} location - Job location
 * @property {string} country - Country code
 * @property {string} description - Job description
 * @property {string[]} requirements - Required skills/qualifications
 * @property {string} salary - Salary information
 * @property {string} posted - Posting date
 * @property {string} deadline - Application deadline
 */

/**
 * @typedef {Object} Post
 * @property {string} id - Unique post identifier
 * @property {string} title - Post title
 * @property {string} content - Post content
 * @property {string} category - Post category
 * @property {string} author - Author name
 * @property {string} date - Publication date
 * @property {number} likes - Number of likes
 * @property {number} comments - Number of comments
 * @property {string} university - University slug
 */

/**
 * @typedef {Object} ApiKeyRegistration
 * @property {string} registration_id - Registration identifier
 * @property {string} api_key - Generated API key
 * @property {string} message - Status message
 */

/**
 * @typedef {Object} LeaderboardEntry
 * @property {string} userId - User identifier
 * @property {string} name - User name
 * @property {number} score - User score
 * @property {number} posts - Number of posts
 * @property {number} rank - Current rank
 */

/**
 * @typedef {Object} MemberStats
 * @property {number} total - Total members
 * @property {number} active - Active members
 * @property {number} new_this_month - New members this month
 * @property {Object} by_university - Members by university
 */

/**
 * @typedef {Object} ApiKeyStatus
 * @property {string} api_key - API key (partially masked)
 * @property {string} name - Developer name
 * @property {string} organisation - Organisation name
 * @property {string} created_at - Creation date
 * @property {string} last_used - Last usage date
 * @property {number} request_count - Total request count
 * @property {boolean} is_active - Whether key is active
 * @property {Object} rate_limit - Rate limit information
 */

/**
 * @const {string} BASE_URL - Base URL for all API endpoints
 */
const BASE_URL = 'https://api.bugema.ac.ug/v1';

/**
 * Error codes used throughout the API
 * @enum {string}
 */
const ERROR_CODES = {
  /** Invalid or missing API key */
  INVALID_API_KEY: 'INVALID_API_KEY',
  /** API key required for this endpoint */
  MISSING_API_KEY: 'MISSING_API_KEY',
  /** Rate limit exceeded */
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  /** Resource not found */
  NOT_FOUND: 'NOT_FOUND',
  /** Required fields missing */
  MISSING_FIELDS: 'MISSING_FIELDS',
  /** Internal server error */
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  /** Validation error */
  VALIDATION_ERROR: 'VALIDATION_ERROR'
};

/**
 * HTTP status codes used throughout the API
 * @enum {number}
 */
const HTTP_STATUS = {
  /** Successful request */
  OK: 200,
  /** Resource created */
  CREATED: 201,
  /** Bad request */
  BAD_REQUEST: 400,
  /** Unauthorized */
  UNAUTHORIZED: 401,
  /** Forbidden */
  FORBIDDEN: 403,
  /** Resource not found */
  NOT_FOUND: 404,
  /** Too many requests */
  TOO_MANY_REQUESTS: 429,
  /** Internal server error */
  INTERNAL_SERVER_ERROR: 500
};

/**
 * @namespace Authentication
 * @description Authentication and authorization documentation
 */
const Authentication = {
  /**
   * API key authentication for protected endpoints
   * @description All protected endpoints require an API key sent in the X-API-Key header
   * @example
   * GET /api/v1/members/count
   * Headers: {
   *   "X-API-Key": "your-api-key-here"
   * }
   */
  apiKey: {
    description: 'API key authentication',
    header: 'X-API-Key',
    format: 'UUID',
    required: true,
    examples: [
      '550e8400-e29b-41d4-a716-446655440000'
    ]
  }
};

/**
 * @namespace RateLimiting
 * @description Rate limiting documentation
 */
const RateLimiting = {
  /**
   * Public endpoints rate limiting
   * @description Public endpoints are rate limited by IP address
   * @property {number} windowMs - Time window in milliseconds (15 minutes)
   * @property {number} max - Maximum requests per window (100)
   */
  public: {
    windowMs: 900000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: 900
  },
  
  /**
   * API key endpoints rate limiting
   * @description Protected endpoints are rate limited by API key
   * @property {number} windowMs - Time window in milliseconds (1 hour)
   * @property {number} max - Maximum requests per window (100)
   */
  apiKey: {
    windowMs: 3600000, // 1 hour
    max: 100,
    message: 'Too many requests. Limit: 100/hour.',
    retryAfter: 3600
  }
};

/**
 * @namespace Endpoints
 * @description API endpoints documentation
 */
const Endpoints = {
  /**
   * Events endpoints
   * @namespace Events
   */
  Events: {
    /**
     * Get all events with optional filtering
     * @route GET /api/v1/events
     * @param {string} [university] - Filter by university slug
     * @param {number} [limit=10] - Limit number of results
     * @param {number} [page=1] - Page number for pagination
     * @returns {Event[]} Array of events
     * @example
     * // Get all events
     * GET /api/v1/events
     * 
     * // Filter by university
     * GET /api/v1/events?university=bugema
     * 
     * // Paginate results
     * GET /api/v1/events?page=2&limit=20
     */
    getAll: {
      method: 'GET',
      path: '/api/v1/events',
      description: 'Get events with optional filtering',
      parameters: {
        university: { type: 'string', required: false, description: 'Filter by university slug' },
        limit: { type: 'number', required: false, default: 10, description: 'Limit number of results' },
        page: { type: 'number', required: false, default: 1, description: 'Page number for pagination' }
      },
      responses: {
        200: {
          description: 'Successful response',
          content: {
            success: true,
            data: [
              {
                id: '1',
                title: 'Career Fair 2024',
                description: 'Annual career fair with top companies',
                date: '2024-05-15',
                time: '10:00',
                location: 'Main Campus',
                university: 'bugema',
                category: 'career',
                attendees: 250
              }
            ],
            meta: {
              total: 150,
              page: 1,
              limit: 10,
              university: 'bugema'
            }
          }
        }
      }
    },
    
    /**
     * Get event by ID
     * @route GET /api/v1/events/:id
     * @param {string} id - Event ID
     * @returns {Event} Event details
     * @example
     * GET /api/v1/events/1
     */
    getById: {
      method: 'GET',
      path: '/api/v1/events/:id',
      description: 'Get event by ID',
      parameters: {
        id: { type: 'string', required: true, description: 'Event ID' }
      },
      responses: {
        200: {
          description: 'Successful response',
          content: {
            success: true,
            data: {
              id: '1',
              title: 'Career Fair 2024',
              description: 'Annual career fair with top companies',
              date: '2024-05-15',
              time: '10:00',
              location: 'Main Campus',
              university: 'bugema',
              category: 'career',
              attendees: 250
            }
          }
        },
        404: {
          description: 'Event not found',
          content: {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Event not found'
            }
          }
        }
      }
    }
  },
  
  /**
   * Clubs endpoints
   * @namespace Clubs
   */
  Clubs: {
    /**
     * Get all clubs with optional filtering
     * @route GET /api/v1/clubs
     * @param {string} [category] - Filter by category
     * @param {number} [limit=10] - Limit number of results
     * @returns {Club[]} Array of clubs
     * @example
     * // Get all clubs
     * GET /api/v1/clubs
     * 
     * // Filter by category
     * GET /api/v1/clubs?category=sports
     */
    getAll: {
      method: 'GET',
      path: '/api/v1/clubs',
      description: 'Get clubs with optional filtering',
      parameters: {
        category: { type: 'string', required: false, description: 'Filter by category' },
        limit: { type: 'number', required: false, default: 10, description: 'Limit number of results' }
      }
    }
  },
  
  /**
   * Universities endpoints
   * @namespace Universities
   */
  Universities: {
    /**
     * Get all universities
     * @route GET /api/v1/universities
     * @returns {University[]} Array of universities
     * @example
     * GET /api/v1/universities
     */
    getAll: {
      method: 'GET',
      path: '/api/v1/universities',
      description: 'Get all universities'
    },
    
    /**
     * Get university by slug
     * @route GET /api/v1/universities/:slug
     * @param {string} slug - University slug
     * @returns {University} University details
     * @example
     * GET /api/v1/universities/bugema
     */
    getBySlug: {
      method: 'GET',
      path: '/api/v1/universities/:slug',
      description: 'Get university by slug',
      parameters: {
        slug: { type: 'string', required: true, description: 'University slug' }
      }
    }
  },
  
  /**
   * Jobs endpoints
   * @namespace Jobs
   */
  Jobs: {
    /**
     * Get all jobs with optional filtering
     * @route GET /api/v1/jobs
     * @param {string} [type] - Filter by job type
     * @param {string} [country] - Filter by country code
     * @param {number} [limit=10] - Limit number of results
     * @returns {Job[]} Array of jobs
     * @example
     * // Get all jobs
     * GET /api/v1/jobs
     * 
     * // Filter by type
     * GET /api/v1/jobs?type=internship
     * 
     // Filter by country
     * GET /api/v1/jobs?country=UG
     */
    getAll: {
      method: 'GET',
      path: '/api/v1/jobs',
      description: 'Get jobs with optional filtering',
      parameters: {
        type: { type: 'string', required: false, description: 'Filter by job type (internship, full-time, part-time)' },
        country: { type: 'string', required: false, description: 'Filter by country code' },
        limit: { type: 'number', required: false, default: 10, description: 'Limit number of results' }
      }
    }
  },
  
  /**
   * Posts endpoints
   * @namespace Posts
   */
  Posts: {
    /**
     * Get all posts with optional filtering
     * @route GET /api/v1/posts
     * @param {string} [category] - Filter by category
     * @param {number} [limit=20] - Limit number of results
     * @param {number} [page=1] - Page number for pagination
     * @returns {Post[]} Array of posts
     * @example
     * // Get all posts
     * GET /api/v1/posts
     * 
     // Filter by category
     * GET /api/v1/posts?category=news
     */
    getAll: {
      method: 'GET',
      path: '/api/v1/posts',
      description: 'Get posts with optional filtering',
      parameters: {
        category: { type: 'string', required: false, description: 'Filter by category' },
        limit: { type: 'number', required: false, default: 20, description: 'Limit number of results' },
        page: { type: 'number', required: false, default: 1, description: 'Page number for pagination' }
      }
    }
  },
  
  /**
   * Protected endpoints (require API key)
   * @namespace Protected
   */
  Protected: {
    /**
     * Get member count statistics
     * @route GET /api/v1/members/count
     * @requires {string} X-API-Key - Valid API key in header
     * @returns {MemberStats} Member statistics
     * @example
     * GET /api/v1/members/count
     * Headers: {
     *   "X-API-Key": "your-api-key-here"
     * }
     */
    memberCount: {
      method: 'GET',
      path: '/api/v1/members/count',
      description: 'Get total member count (API key required)',
      headers: {
        'X-API-Key': { required: true, description: 'Your API key' }
      },
      responses: {
        200: {
          description: 'Successful response',
          content: {
            success: true,
            data: {
              total: 5000,
              active: 3200,
              new_this_month: 150,
              by_university: {
                bugema: 5000,
                makerere: 40000
              }
            }
          }
        },
        401: {
          description: 'API key required',
          content: {
            success: false,
            error: {
              code: 'MISSING_API_KEY',
              message: 'API key is required for this endpoint'
            }
          }
        }
      }
    },
    
    /**
     * Get leaderboard with period filtering
     * @route GET /api/v1/leaderboard
     * @param {string} [period=all-time] - Filter by period
     * @requires {string} X-API-Key - Valid API key in header
     * @returns {LeaderboardEntry[]} Leaderboard data
     * @example
     * GET /api/v1/leaderboard?period=monthly
     * Headers: {
     *   "X-API-Key": "your-api-key-here"
     * }
     */
    leaderboard: {
      method: 'GET',
      path: '/api/v1/leaderboard',
      description: 'Get leaderboard with period filtering (API key required)',
      parameters: {
        period: { type: 'string', required: false, default: 'all-time', description: 'Filter by period (monthly, weekly, all-time)' }
      },
      headers: {
        'X-API-Key': { required: true, description: 'Your API key' }
      }
    }
  },
  
  /**
   * Developer endpoints
   * @namespace Developers
   */
  Developers: {
    /**
     * Register for API key
     * @route POST /api/v1/developers/register
     * @param {Object} body - Registration data
     * @param {string} body.name - Developer name
     * @param {string} body.organisation - Organisation name
     * @param {string} body.use_case - Use case description
     * @returns {ApiKeyRegistration} Registration result with API key
     * @example
     * POST /api/v1/developers/register
     * Body: {
     *   "name": "John Doe",
     *   "organisation": "Tech Corp",
     *   "use_case": "Building a university portal"
     * }
     */
    register: {
      method: 'POST',
      path: '/api/v1/developers/register',
      description: 'Register for API key',
      requestBody: {
        name: { type: 'string', required: true, description: 'Developer name' },
        organisation: { type: 'string', required: true, description: 'Organisation name' },
        use_case: { type: 'string', required: true, description: 'Use case description' }
      },
      responses: {
        201: {
          description: 'Registration successful',
          content: {
            success: true,
            data: {
              registration_id: 'uuid-123',
              api_key: 'uuid-456',
              message: 'API key generated successfully'
            }
          }
        }
      }
    }
  }
};

/**
 * Code examples for different programming languages
 * @namespace CodeExamples
 */
const CodeExamples = {
  /**
   * JavaScript (Fetch API) example
   * @example
   * // Get events with API key
   * const apiKey = 'your-api-key-here';
   * 
   * fetch('/api/v1/events?university=bugema&limit=5', {
   *   headers: {
   *     'X-API-Key': apiKey
   *   }
   * })
   * .then(response => response.json())
   * .then(data => console.log(data));
   */
  javascript: {
    getEvents: `// Get events with API key
const apiKey = 'your-api-key-here';

fetch('/api/v1/events?university=bugema&limit=5', {
  headers: {
    'X-API-Key': apiKey
  }
})
.then(response => response.json())
.then(data => console.log(data));`,
    
    getEventsWithParams: `// Get events with parameters
const params = new URLSearchParams({
  university: 'bugema',
  limit: '10',
  page: '1'
});

fetch(\`\${BASE_URL}/events?\${params}\`, {
  headers: {
    'X-API-Key': apiKey
  }
})
.then(response => response.json())
.then(data => console.log(data));`,
    
    errorHandling: `// Error handling
fetch(\`\${BASE_URL}/events\`, {
  headers: {
    'X-API-Key': apiKey
  }
})
.then(response => {
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  return response.json();
})
.then(data => {
  if (data.success) {
    console.log('Success:', data.data);
  } else {
    console.error('Error:', data.error);
  }
})
.catch(error => console.error('Request failed:', error));`
  },
  
  /**
   * Python (requests) example
   * @example
   * import requests
   * 
   * # Get events with API key
   * api_key = 'your-api-key-here'
   * headers = {'X-API-Key': api_key}
   * 
   * response = requests.get('/api/v1/events?university=bugema&limit=5', headers=headers)
   * data = response.json()
   * print(data)
   */
  python: {
    getEvents: `import requests

# Get events with API key
api_key = 'your-api-key-here'
headers = {'X-API-Key': api_key}

response = requests.get('/api/v1/events?university=bugema&limit=5', headers=headers)
data = response.json()
print(data)`,
    
    getEventsWithParams: `import requests

# Get events with parameters
params = {
  'university': 'bugema',
  'limit': '10',
  'page': '1'
}

response = requests.get('/api/v1/events', params=params, headers=headers)
data = response.json()
print(data)`,
    
    errorHandling: `import requests

api_key = 'your-api-key-here'
headers = {'X-API-Key': api_key}

try:
  response = requests.get('/api/v1/events', headers=headers)
  data = response.json()
  
  if data['success']:
    print('Success:', data['data'])
  else:
    print('Error:', data['error'])
except requests.exceptions.RequestException as e:
  print('Request failed:', e)`
  },
  
  /**
   * PHP (cURL) example
   * @example
   * <?php
   * // Get events with API key
   * $apiKey = 'your-api-key-here';
   * 
   * $ch = curl_init();
   * curl_setopt($ch, CURLOPT_URL, '/api/v1/events?university=bugema&limit=5');
   * curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
   * curl_setopt($ch, CURLOPT_HTTPHEADER, [
   *   'X-API-Key: ' . $apiKey
   * ]);
   * 
   * $response = curl_exec($ch);
   * $data = json_decode($response, true);
   * print_r($data);
   * curl_close($ch);
   * ?>
   */
  php: {
    getEvents: `<?php
// Get events with API key
$apiKey = 'your-api-key-here';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/v1/events?university=bugema&limit=5');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'X-API-Key: ' . $apiKey
]);

$response = curl_exec($ch);
$data = json_decode($response, true);

if ($data['success']) {
  echo 'Success: ';
  print_r($data['data']);
} else {
  echo 'Error: ' . $data['error']['message'];
}

curl_close($ch);
?>`,
    
    errorHandling: `<?php
$apiKey = 'your-api-key-here';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/v1/events');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'X-API-Key: ' . $apiKey
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($httpCode === 200) {
  $data = json_decode($response, true);
  if ($data['success']) {
    echo 'Success: ';
    print_r($data['data']);
  } else {
    echo 'Error: ' . $data['error']['message'];
  }
} else {
  echo 'HTTP Error: ' . $httpCode;
}

curl_close($ch);
?>`
  }
};

/**
 * Common response patterns
 * @namespace ResponsePatterns
 */
const ResponsePatterns = {
  /**
   * Success response pattern
   * @example
   * {
   *   "success": true,
   *   "data": [...],
   *   "meta": {
   *     "total": 100,
   *     "page": 1,
   *     "limit": 10
   *   }
   * }
   */
  success: {
    success: true,
    data: 'response_data',
    meta: {
      total: 'number',
      page: 'number',
      limit: 'number'
    }
  },
  
  /**
   * Error response pattern
   * @example
   * {
   *   "success": false,
   *   "error": {
   *     "code": "ERROR_CODE",
   *     "message": "Error description",
   *     "retry_after": 3600
   *   }
   * }
   */
  error: {
    success: false,
    error: {
      code: 'ERROR_CODE',
      message: 'Error description',
      retry_after: 'number'
    }
  }
};

/**
 * Best practices and guidelines
 * @namespace BestPractices
 */
const BestPractices = {
  /**
   * Authentication best practices
   * @description Guidelines for using API keys securely
   */
  authentication: {
    keepApiKeySecret: 'Never expose your API key in client-side code',
    useEnvironmentVariables: 'Store API keys in environment variables',
    rotateKeysRegularly: 'Rotate API keys periodically for security',
    monitorUsage: 'Monitor API key usage for unusual activity'
  },
  
  /**
   * Error handling best practices
   * @description Guidelines for handling API errors gracefully
   */
  errorHandling: {
    checkSuccessField: 'Always check the success field before accessing data',
    handleRateLimits: 'Respect rate limit headers and retry after specified time',
    logErrors: 'Log errors for debugging but don't expose sensitive information',
    provideFeedback: 'Give users clear feedback when requests fail'
  },
  
  /**
   * Performance best practices
   * @description Guidelines for optimal API performance
   */
  performance: {
    usePagination: 'Use pagination for large datasets',
    filterEarly: 'Apply filters early to reduce response size',
    cacheResponses: 'Cache responses when appropriate',
    compressData: 'Use gzip compression for large responses'
  }
};

module.exports = {
  BASE_URL,
  ERROR_CODES,
  HTTP_STATUS,
  Authentication,
  RateLimiting,
  Endpoints,
  CodeExamples,
  ResponsePatterns,
  BestPractices
};
