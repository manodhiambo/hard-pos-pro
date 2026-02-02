/**
 * Authentication & Authorization Middleware
 * Helvino Technologies Limited
 */

const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const ApiResponse = require('../utils/response');

/**
 * Verify JWT token and authenticate user
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.unauthorized(res, 'No token provided');
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if session exists and is valid
    const session = await prisma.userSession.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            role: true,
            branch: true,
          },
        },
      },
    });

    if (!session) {
      return ApiResponse.unauthorized(res, 'Invalid session');
    }

    if (new Date(session.expiresAt) < new Date()) {
      await prisma.userSession.delete({ where: { id: session.id } });
      return ApiResponse.unauthorized(res, 'Session expired');
    }

    if (!session.user.isActive) {
      return ApiResponse.forbidden(res, 'User account is inactive');
    }

    // Attach user to request
    req.user = session.user;
    req.session = session;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.unauthorized(res, 'Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized(res, 'Token expired');
    }
    return ApiResponse.serverError(res, 'Authentication failed', error);
  }
};

/**
 * Check if user has required permissions
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Not authenticated');
    }

    if (!req.user.role) {
      return ApiResponse.forbidden(res, 'No role assigned');
    }

    const userRole = req.user.role.roleName;

    // Super Admin has access to everything
    if (userRole === 'Super Admin') {
      return next();
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(userRole)) {
      return ApiResponse.forbidden(
        res,
        'You do not have permission to perform this action'
      );
    }

    next();
  };
};

/**
 * Check if user has specific permission
 */
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return ApiResponse.forbidden(res, 'No permissions assigned');
    }

    const permissions = req.user.role.permissions;

    // Super Admin has all permissions
    if (permissions.includes('all')) {
      return next();
    }

    if (!permissions.includes(permission)) {
      return ApiResponse.forbidden(
        res,
        `Permission '${permission}' required`
      );
    }

    next();
  };
};

/**
 * Optional authentication - attach user if token provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const session = await prisma.userSession.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            role: true,
            branch: true,
          },
        },
      },
    });

    if (session && new Date(session.expiresAt) > new Date()) {
      req.user = session.user;
      req.session = session;
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  checkPermission,
  optionalAuth,
};
