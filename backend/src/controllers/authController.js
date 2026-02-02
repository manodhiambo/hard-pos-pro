/**
 * Authentication Controller
 * Helvino Technologies Limited
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const ApiResponse = require('../utils/response');

const authController = {
  /**
   * User Login
   */
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { username },
        include: {
          role: true,
          branch: true,
        },
      });

      if (!user) {
        return ApiResponse.unauthorized(res, 'Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        return ApiResponse.forbidden(res, 'User account is inactive');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      
      if (!isValidPassword) {
        return ApiResponse.unauthorized(res, 'Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id,
          username: user.username,
          roleId: user.roleId,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Create session
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await prisma.userSession.create({
        data: {
          userId: user.id,
          token,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          expiresAt,
        },
      });

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // Remove sensitive data
      delete user.passwordHash;
      delete user.pinHash;
      delete user.fingerprintData;

      return ApiResponse.success(res, {
        user,
        token,
        expiresIn: '24h',
      }, 'Login successful');

    } catch (error) {
      console.error('Login error:', error);
      return ApiResponse.serverError(res, 'Login failed', error);
    }
  },

  /**
   * User Logout
   */
  logout: async (req, res) => {
    try {
      // Delete session
      if (req.session) {
        await prisma.userSession.delete({
          where: { id: req.session.id },
        });
      }

      return ApiResponse.success(res, null, 'Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      return ApiResponse.serverError(res, 'Logout failed', error);
    }
  },

  /**
   * Get Current User Profile
   */
  getProfile: async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          role: true,
          branch: true,
        },
      });

      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
      }

      // Remove sensitive data
      delete user.passwordHash;
      delete user.pinHash;
      delete user.fingerprintData;

      return ApiResponse.success(res, user, 'Profile retrieved successfully');
    } catch (error) {
      console.error('Get profile error:', error);
      return ApiResponse.serverError(res, 'Failed to get profile', error);
    }
  },

  /**
   * Change Password
   */
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );

      if (!isValidPassword) {
        return ApiResponse.badRequest(res, 'Current password is incorrect');
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { id: req.user.id },
        data: { passwordHash },
      });

      // Invalidate all existing sessions except current
      await prisma.userSession.deleteMany({
        where: {
          userId: req.user.id,
          NOT: { id: req.session.id },
        },
      });

      return ApiResponse.success(res, null, 'Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      return ApiResponse.serverError(res, 'Failed to change password', error);
    }
  },

  /**
   * Refresh Token
   */
  refreshToken: async (req, res) => {
    try {
      const { token: oldToken } = req.body;

      // Verify old token
      const decoded = jwt.verify(oldToken, process.env.JWT_SECRET, {
        ignoreExpiration: true,
      });

      // Check if session exists
      const session = await prisma.userSession.findUnique({
        where: { token: oldToken },
        include: { user: true },
      });

      if (!session) {
        return ApiResponse.unauthorized(res, 'Invalid session');
      }

      // Generate new token
      const newToken = jwt.sign(
        {
          userId: decoded.userId,
          username: decoded.username,
          roleId: decoded.roleId,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Update session
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await prisma.userSession.update({
        where: { id: session.id },
        data: {
          token: newToken,
          expiresAt,
        },
      });

      return ApiResponse.success(res, {
        token: newToken,
        expiresIn: '24h',
      }, 'Token refreshed successfully');

    } catch (error) {
      console.error('Refresh token error:', error);
      return ApiResponse.serverError(res, 'Failed to refresh token', error);
    }
  },
};

module.exports = authController;
