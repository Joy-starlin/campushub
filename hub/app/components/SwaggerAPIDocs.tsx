'use client'

import { useState, useEffect } from 'react'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

interface SwaggerAPIDocsProps {
  specUrl?: string
  className?: string
}

export default function SwaggerAPIDocs({ specUrl = '/api/v1/swagger.json', className = '' }: SwaggerAPIDocsProps) {
  const [spec, setSpec] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSpec = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(specUrl)
        if (!response.ok) {
          throw new Error('Failed to load API specification')
        }
        const data = await response.json()
        setSpec(data)
        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setIsLoading(false)
      }
    }

    loadSpec()
  }, [specUrl])

  // Fallback spec if loading fails
  const fallbackSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Bugema Hub API',
      version: '1.0.0',
      description: 'Public REST API for Bugema Hub data',
      contact: {
        name: 'API Support',
        email: 'api@bugema.ac.ug'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'https://api.bugema.ac.ug',
        description: 'Production server'
      }
    ],
    paths: {
      '/api/v1/events': {
        get: {
          summary: 'Get all events',
          description: 'Retrieve a list of events with optional filtering',
          tags: ['Events'],
          parameters: [
            {
              name: 'university',
              in: 'query',
              description: 'Filter by university slug',
              schema: {
                type: 'string'
              }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Limit number of results',
              schema: {
                type: 'integer',
                default: 10
              }
            },
            {
              name: 'page',
              in: 'query',
              description: 'Page number for pagination',
              schema: {
                type: 'integer',
                default: 1
              }
            }
          ],
          responses: {
            200: {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Event'
                        }
                      },
                      meta: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          limit: { type: 'integer' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/events/{id}': {
        get: {
          summary: 'Get event by ID',
          description: 'Retrieve a specific event by its ID',
          tags: ['Events'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Event ID',
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            200: {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        $ref: '#/components/schemas/Event'
                      }
                    }
                  }
                }
              }
            },
            404: {
              description: 'Event not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        Event: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            date: { type: 'string', format: 'date' },
            time: { type: 'string', format: 'time' },
            location: { type: 'string' },
            university: { type: 'string' },
            category: { type: 'string' },
            attendees: { type: 'integer' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                retry_after: { type: 'integer' }
              }
            }
          }
        }
      },
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for authentication'
        }
      }
    },
    tags: [
      {
        name: 'Events',
        description: 'Event management endpoints'
      }
    ]
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading API documentation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
        <div className="text-center max-w-md">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Documentation
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-50 dark:bg-gray-900 ${className}`}>
      <SwaggerUI
        spec={spec || fallbackSpec}
        url={specUrl}
        tryItOutEnabled={true}
        displayOperationId={false}
        displayRequestDuration={true}
        filter={true}
        docExpansion="list"
        defaultModelsExpandDepth={1}
        defaultModelExpandDepth={1}
        showExtensions={true}
        showCommonExtensions={true}
        plugins={[
          // You can add custom Swagger UI plugins here
        ]}
        onComplete={(system: any) => {
          console.log('Swagger UI loaded successfully')
        }}
      />
    </div>
  )
}

// Custom Swagger UI theme
export const swaggerTheme = {
  colors: {
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8'
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280'
    },
    background: {
      default: '#ffffff',
      paper: '#f9fafb'
    }
  }
}

// API specification generator helper
export function generateAPISpec() {
  return {
    openapi: '3.0.0',
    info: {
      title: 'Bugema Hub API',
      version: '1.0.0',
      description: 'Public REST API for Bugema Hub data including events, clubs, universities, jobs, and posts.',
      contact: {
        name: 'API Support',
        email: 'api@bugema.ac.ug',
        url: 'https://bugema.ac.ug/support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      },
      termsOfService: 'https://bugema.ac.ug/terms'
    },
    servers: [
      {
        url: 'https://api.bugema.ac.ug/v1',
        description: 'Production server'
      },
      {
        url: 'http://localhost:3001/v1',
        description: 'Development server'
      }
    ],
    paths: {
      '/events': {
        get: {
          summary: 'Get all events',
          description: 'Retrieve a list of events with optional filtering and pagination.',
          tags: ['Events'],
          parameters: [
            {
              name: 'university',
              in: 'query',
              description: 'Filter by university slug',
              required: false,
              schema: {
                type: 'string',
                example: 'bugema'
              }
            },
            {
              name: 'category',
              in: 'query',
              description: 'Filter by event category',
              required: false,
              schema: {
                type: 'string',
                enum: ['academic', 'career', 'sports', 'cultural', 'social']
              }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Maximum number of results to return',
              required: false,
              schema: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
                default: 10
              }
            },
            {
              name: 'page',
              in: 'query',
              description: 'Page number for pagination',
              required: false,
              schema: {
                type: 'integer',
                minimum: 1,
                default: 1
              }
            }
          ],
          responses: {
            200: {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/EventsResponse'
                  }
                }
              }
            },
            400: {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create a new event',
          description: 'Create a new event with the provided details.',
          tags: ['Events'],
          security: [
            {
              ApiKeyAuth: []
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateEvent'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Event created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/EventResponse'
                  }
                }
              }
            },
            400: {
              description: 'Invalid input',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/events/{id}': {
        get: {
          summary: 'Get event by ID',
          description: 'Retrieve a specific event by its unique identifier.',
          tags: ['Events'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Event unique identifier',
              schema: {
                type: 'string',
                format: 'uuid'
              }
            }
          ],
          responses: {
            200: {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/EventResponse'
                  }
                }
              }
            },
            404: {
              description: 'Event not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        put: {
          summary: 'Update event',
          description: 'Update an existing event with new details.',
          tags: ['Events'],
          security: [
            {
              ApiKeyAuth: []
            }
          ],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Event unique identifier',
              schema: {
                type: 'string',
                format: 'uuid'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UpdateEvent'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Event updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/EventResponse'
                  }
                }
              }
            },
            400: {
              description: 'Invalid input',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            404: {
              description: 'Event not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        delete: {
          summary: 'Delete event',
          description: 'Delete an existing event.',
          tags: ['Events'],
          security: [
            {
              ApiKeyAuth: []
            }
          ],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Event unique identifier',
              schema: {
                type: 'string',
                format: 'uuid'
              }
            }
          ],
          responses: {
            204: {
              description: 'Event deleted successfully'
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            404: {
              description: 'Event not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        Event: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Event unique identifier'
            },
            title: {
              type: 'string',
              description: 'Event title'
            },
            description: {
              type: 'string',
              description: 'Event description'
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Event date'
            },
            time: {
              type: 'string',
              format: 'time',
              description: 'Event time'
            },
            location: {
              type: 'string',
              description: 'Event location'
            },
            university: {
              type: 'string',
              description: 'University slug'
            },
            category: {
              type: 'string',
              enum: ['academic', 'career', 'sports', 'cultural', 'social'],
              description: 'Event category'
            },
            attendees: {
              type: 'integer',
              description: 'Number of attendees'
            },
            image: {
              type: 'string',
              format: 'uri',
              description: 'Event image URL'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Event creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Event last update timestamp'
            }
          },
          required: ['title', 'description', 'date', 'time', 'location', 'university', 'category']
        },
        EventsResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Event'
              }
            },
            meta: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                  description: 'Total number of events'
                },
                page: {
                  type: 'integer',
                  description: 'Current page number'
                },
                limit: {
                  type: 'integer',
                  description: 'Number of items per page'
                },
                university: {
                  type: 'string',
                  description: 'University filter applied'
                }
              }
            }
          }
        },
        EventResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            data: {
              $ref: '#/components/schemas/Event'
            }
          }
        },
        CreateEvent: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Event title'
            },
            description: {
              type: 'string',
              description: 'Event description'
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Event date'
            },
            time: {
              type: 'string',
              format: 'time',
              description: 'Event time'
            },
            location: {
              type: 'string',
              description: 'Event location'
            },
            university: {
              type: 'string',
              description: 'University slug'
            },
            category: {
              type: 'string',
              enum: ['academic', 'career', 'sports', 'cultural', 'social'],
              description: 'Event category'
            },
            image: {
              type: 'string',
              format: 'uri',
              description: 'Event image URL'
            }
          },
          required: ['title', 'description', 'date', 'time', 'location', 'university', 'category']
        },
        UpdateEvent: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Event title'
            },
            description: {
              type: 'string',
              description: 'Event description'
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Event date'
            },
            time: {
              type: 'string',
              format: 'time',
              description: 'Event time'
            },
            location: {
              type: 'string',
              description: 'Event location'
            },
            category: {
              type: 'string',
              enum: ['academic', 'career', 'sports', 'cultural', 'social'],
              description: 'Event category'
            },
            image: {
              type: 'string',
              format: 'uri',
              description: 'Event image URL'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'Error code',
                  example: 'NOT_FOUND'
                },
                message: {
                  type: 'string',
                  description: 'Error message',
                  example: 'Event not found'
                },
                retry_after: {
                  type: 'integer',
                  description: 'Seconds to wait before retrying',
                  example: 3600
                }
              }
            }
          }
        }
      },
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for authentication. Get your key at /api/v1/developers/register'
        }
      }
    },
    tags: [
      {
        name: 'Events',
        description: 'Event management endpoints'
      },
      {
        name: 'Clubs',
        description: 'Club management endpoints'
      },
      {
        name: 'Universities',
        description: 'University information endpoints'
      },
      {
        name: 'Jobs',
        description: 'Job posting endpoints'
      },
      {
        name: 'Posts',
        description: 'Post management endpoints'
      },
      {
        name: 'Developers',
        description: 'Developer and API key management endpoints'
      }
    ]
  }
}
