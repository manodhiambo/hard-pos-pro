/**
 * User Routes
 * Helvino Technologies Limited
 */

const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @route   GET /api/v1/users
 * @desc    Get all users
 * @access  Private (Super Admin, Branch Manager)
 */
router.get(
  '/',
  authenticate,
  authorize('Super Admin', 'Branch Manager'),
  userController.getAllUsers
);

/**
 * @route   GET /api/v1/users/roles
 * @desc    Get all roles
 * @access  Private
 */
router.get('/roles', authenticate, userController.getAllRoles);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private (Super Admin, Branch Manager)
 */
router.get(
  '/:id',
  authenticate,
  authorize('Super Admin', 'Branch Manager'),
  userController.getUserById
);

/**
 * @route   POST /api/v1/users
 * @desc    Create user
 * @access  Private (Super Admin, Branch Manager)
 */
router.post(
  '/',
  authenticate,
  authorize('Super Admin', 'Branch Manager'),
  createLimiter,
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
  ],
  validate,
  userController.createUser
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Private (Super Admin, Branch Manager)
 */
router.put(
  '/:id',
  authenticate,
  authorize('Super Admin', 'Branch Manager'),
  userController.updateUser
);

/**
 * @route   PUT /api/v1/users/:id/deactivate
 * @desc    Deactivate user
 * @access  Private (Super Admin)
 */
router.put(
  '/:id/deactivate',
  authenticate,
  authorize('Super Admin'),
  userController.deactivateUser
);

/**
 * @route   PUT /api/v1/users/:id/reset-password
 * @desc    Reset user password
 * @access  Private (Super Admin, Branch Manager)
 */
router.put(
  '/:id/reset-password',
  authenticate,
  authorize('Super Admin', 'Branch Manager'),
  [
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  userController.resetUserPassword
);

module.exports = router;
