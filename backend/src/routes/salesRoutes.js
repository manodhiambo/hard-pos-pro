/**
 * Sales Routes
 * Helvino Technologies Limited
 */

const express = require('express');
const { body } = require('express-validator');
const salesController = require('../controllers/salesController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @route   GET /api/v1/sales
 * @desc    Get all sales with pagination
 * @access  Private
 */
router.get('/', authenticate, salesController.getAllSales);

/**
 * @route   GET /api/v1/sales/summary
 * @desc    Get sales summary/statistics
 * @access  Private
 */
router.get('/summary', authenticate, salesController.getSalesSummary);

/**
 * @route   GET /api/v1/sales/today
 * @desc    Get today's sales
 * @access  Private
 */
router.get('/today', authenticate, salesController.getTodaySales);

/**
 * @route   GET /api/v1/sales/:id
 * @desc    Get sale by ID
 * @access  Private
 */
router.get('/:id', authenticate, salesController.getSaleById);

/**
 * @route   POST /api/v1/sales
 * @desc    Create new sale
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  [
    body('items')
      .isArray({ min: 1 })
      .withMessage('At least one item is required'),
    body('items.*.productId')
      .notEmpty()
      .withMessage('Product ID is required for each item'),
    body('items.*.quantity')
      .isFloat({ min: 0.01 })
      .withMessage('Valid quantity is required for each item'),
  ],
  validate,
  salesController.createSale
);

/**
 * @route   PUT /api/v1/sales/:id/cancel
 * @desc    Cancel sale
 * @access  Private (Branch Manager, Super Admin)
 */
router.put(
  '/:id/cancel',
  authenticate,
  authorize('Super Admin', 'Branch Manager'),
  [
    body('reason').optional().isString(),
  ],
  validate,
  salesController.cancelSale
);

module.exports = router;
