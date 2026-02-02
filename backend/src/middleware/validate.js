/**
 * Request Validation Middleware
 * Helvino Technologies Limited
 */

const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/response');

/**
 * Validate request using express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return ApiResponse.badRequest(
      res,
      'Validation failed',
      extractedErrors
    );
  }

  next();
};

module.exports = validate;
