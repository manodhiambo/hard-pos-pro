/**
 * User Management Controller
 * Helvino Technologies Limited
 */

const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const ApiResponse = require('../utils/response');
const validators = require('../utils/validators');
const helpers = require('../utils/helpers');

const userController = {
  /**
   * Get all users
   */
  getAllUsers: async (req, res) => {
    try {
      const {
        page = 1,
        pageSize = 20,
        search,
        roleId,
        branchId,
        isActive,
      } = req.query;

      const { page: validPage, pageSize: validPageSize } =
        validators.validatePagination(page, pageSize);

      const offset = helpers.getPaginationOffset(validPage, validPageSize);

      const where = {};

      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (roleId) where.roleId = roleId;
      if (branchId) where.branchId = branchId;
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const totalItems = await prisma.user.count({ where });

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          phone: true,
          roleId: true,
          branchId: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          role: true,
          branch: true,
        },
        skip: offset,
        take: validPageSize,
        orderBy: { createdAt: 'desc' },
      });

      return ApiResponse.paginated(
        res,
        users,
        { page: validPage, pageSize: validPageSize, totalItems },
        'Users retrieved successfully'
      );

    } catch (error) {
      console.error('Get users error:', error);
      return ApiResponse.serverError(res, 'Failed to retrieve users', error);
    }
  },

  /**
   * Get user by ID
   */
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          phone: true,
          roleId: true,
          branchId: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          role: true,
          branch: true,
        },
      });

      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
      }

      return ApiResponse.success(res, user, 'User retrieved successfully');

    } catch (error) {
      console.error('Get user error:', error);
      return ApiResponse.serverError(res, 'Failed to retrieve user', error);
    }
  },

  /**
   * Create user
   */
  createUser: async (req, res) => {
    try {
      const {
        username,
        email,
        password,
        fullName,
        phone,
        roleId,
        branchId,
      } = req.body;

      // Check if username exists
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        return ApiResponse.conflict(res, 'Username already exists');
      }

      // Check if email exists
      if (email) {
        const existingEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (existingEmail) {
          return ApiResponse.conflict(res, 'Email already exists');
        }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          username,
          email: email || null,
          passwordHash,
          fullName,
          phone: phone || null,
          roleId: roleId || null,
          branchId: branchId || null,
          isActive: true,
        },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          phone: true,
          roleId: true,
          branchId: true,
          isActive: true,
          createdAt: true,
          role: true,
          branch: true,
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'USER_CREATE',
          description: `Created user: ${username}`,
          metadata: { newUserId: user.id },
          ipAddress: req.ip,
        },
      });

      return ApiResponse.created(res, user, 'User created successfully');

    } catch (error) {
      console.error('Create user error:', error);
      return ApiResponse.serverError(res, 'Failed to create user', error);
    }
  },

  /**
   * Update user
   */
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return ApiResponse.notFound(res, 'User not found');
      }

      // Don't allow password update through this endpoint
      delete updateData.passwordHash;
      delete updateData.password;

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          phone: true,
          roleId: true,
          branchId: true,
          isActive: true,
          updatedAt: true,
          role: true,
          branch: true,
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'USER_UPDATE',
          description: `Updated user: ${user.username}`,
          metadata: { updatedUserId: id },
          ipAddress: req.ip,
        },
      });

      return ApiResponse.success(res, user, 'User updated successfully');

    } catch (error) {
      console.error('Update user error:', error);
      return ApiResponse.serverError(res, 'Failed to update user', error);
    }
  },

  /**
   * Deactivate user
   */
  deactivateUser: async (req, res) => {
    try {
      const { id } = req.params;

      if (id === req.user.id) {
        return ApiResponse.badRequest(res, 'Cannot deactivate your own account');
      }

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
      }

      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });

      // Invalidate all sessions
      await prisma.userSession.deleteMany({
        where: { userId: id },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'USER_DEACTIVATE',
          description: `Deactivated user: ${user.username}`,
          metadata: { deactivatedUserId: id },
          ipAddress: req.ip,
        },
      });

      return ApiResponse.success(res, null, 'User deactivated successfully');

    } catch (error) {
      console.error('Deactivate user error:', error);
      return ApiResponse.serverError(res, 'Failed to deactivate user', error);
    }
  },

  /**
   * Reset user password
   */
  resetUserPassword: async (req, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id },
        data: { passwordHash },
      });

      // Invalidate all sessions
      await prisma.userSession.deleteMany({
        where: { userId: id },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'USER_PASSWORD_RESET',
          description: `Reset password for user: ${user.username}`,
          metadata: { resetUserId: id },
          ipAddress: req.ip,
        },
      });

      return ApiResponse.success(res, null, 'Password reset successfully');

    } catch (error) {
      console.error('Reset password error:', error);
      return ApiResponse.serverError(res, 'Failed to reset password', error);
    }
  },

  /**
   * Get all roles
   */
  getAllRoles: async (req, res) => {
    try {
      const roles = await prisma.role.findMany({
        orderBy: { roleName: 'asc' },
      });

      return ApiResponse.success(res, roles, 'Roles retrieved successfully');

    } catch (error) {
      console.error('Get roles error:', error);
      return ApiResponse.serverError(res, 'Failed to retrieve roles', error);
    }
  },
};

module.exports = userController;
