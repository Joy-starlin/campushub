// Standard success response
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

// Standard error response
const errorResponse = (res, error, statusCode = 500) => {
  const response = {
    success: false,
    timestamp: new Date().toISOString()
  };

  if (typeof error === 'string') {
    response.error = error;
  } else if (error.code && error.message) {
    response.error = error.message;
  } else {
    response.error = 'An internal server error occurred';
  }

  return res.status(statusCode).json(response);
};

// Validation error response
const validationErrorResponse = (res, errors, message = 'Validation failed') => {
  return res.status(400).json({
    success: false,
    error: message,
    data: {
      errors
    },
    timestamp: new Date().toISOString()
  });
};

// Not found response
const notFoundResponse = (res, message = 'Resource not found') => {
  return res.status(404).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
};

// Unauthorized response
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return res.status(401).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
};

// Forbidden response
const forbiddenResponse = (res, message = 'Access forbidden') => {
  return res.status(403).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
};

// Conflict response
const conflictResponse = (res, message = 'Resource conflict') => {
  return res.status(409).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
};

// Rate limit response
const rateLimitResponse = (res, message = 'Rate limit exceeded', retryAfter = 60) => {
  return res.status(429).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
};

// Paginated response
const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 20,
      total: pagination.total || 0,
      totalPages: pagination.totalPages || 0,
      hasNextPage: pagination.hasNextPage || false,
      hasPrevPage: pagination.hasPrevPage || false
    },
    timestamp: new Date().toISOString()
  });
};

// Created response
const createdResponse = (res, data, message = 'Resource created successfully') => {
  return res.status(201).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

// No content response
const noContentResponse = (res, message = 'Operation completed successfully') => {
  return res.status(204).json({
    success: true,
    message,
    timestamp: new Date().toISOString()
  });
};

// Bad request response
const badRequestResponse = (res, message = 'Bad request') => {
  return res.status(400).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
};

// Service unavailable response
const serviceUnavailableResponse = (res, message = 'Service temporarily unavailable') => {
  return res.status(503).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
};

// Custom response
const customResponse = (res, statusCode, success, message, data = null, error = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };

  if (data) {
    response.data = data;
  }

  if (error) {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  conflictResponse,
  rateLimitResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse,
  badRequestResponse,
  serviceUnavailableResponse,
  customResponse
};
