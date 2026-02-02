/**
 * Global Error Handler Middleware
 * Helvino Technologies Limited
 */

const ApiResponse = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code === 'P2002') {
    return ApiResponse.conflict(res, 'A record with this value already exists');
  }

  if (err.code === 'P2025') {
    return ApiResponse.notFound(res, 'Record not found');
  }

  if (err.code === 'P2003') {
    return ApiResponse.badRequest(res, 'Referenced record does not exist');
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return ApiResponse.badRequest(res, 'Validation failed', err.errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, 'Token expired');
  }

  // Default server error
  return ApiResponse.serverError(
    res,
    err.message || 'Internal server error',
    process.env.NODE_ENV === 'development' ? err : null
  );
};

module.exports = errorHandler;
