const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    return errorResponse(res, {
      message: 'validation failed',
      errors: errorMessages
    }, 400, 'VALIDATION_ERROR');
  }

  next();
};

module.exports = {
  handleValidationErrors
};
