/**
 * Customer Routes
 * Helvino Technologies Limited
 */

const express = require('express');
const { body } = require('express-validator');
const customerController = require('../controllers/customerController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @route   GET /api/v1/customers
 * @desc    Get all customers with pagination
 * @access  Private
 */
router.get('/', authenticate, customerController.getAllCustomers);

/**
 * @route   GET /api/v1/customers/:id
 * @desc    Get customer by ID
 * @access  Private
 */
router.get('/:id', authenticate, customerController.getCustomerById);

/**
 * @route   GET /api/v1/customers/:id/statement
 * @desc    Get customer statement
 * @access  Private
 */
router.get('/:id/statement', authenticate, customerController.getCustomerStatement);

/**
 * @route   POST /api/v1/customers
 * @desc    Create new customer
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  createLimiter,
  [
    body('customerType')
      .notEmpty()
      .isIn(['retail', 'contractor', 'corporate', 'property_manager'])
      .withMessage('Valid customer type is required'),
    body('customerName')
      .notEmpty()
      .withMessage('Customer name is required'),
    body('phone')
      .optional()
      .isMobilePhone('any')
      .withMessage('Valid phone number is required'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Valid email is required'),
  ],
  validate,
  customerController.createCustomer
);

/**
 * @route   PUT /api/v1/customers/:id
 * @desc    Update customer
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  customerController.updateCustomer
);

module.exports = router;
