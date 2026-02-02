/**
 * Inventory Routes
 * Helvino Technologies Limited
 */

const express = require('express');
const { body } = require('express-validator');
const inventoryController = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @route   GET /api/v1/inventory/stock
 * @desc    Get stock by branch
 * @access  Private
 */
router.get('/stock', authenticate, inventoryController.getStock);

/**
 * @route   GET /api/v1/inventory/movements
 * @desc    Get stock movements
 * @access  Private
 */
router.get('/movements', authenticate, inventoryController.getStockMovements);

/**
 * @route   GET /api/v1/inventory/valuation
 * @desc    Get stock valuation
 * @access  Private
 */
router.get('/valuation', authenticate, inventoryController.getStockValuation);

/**
 * @route   POST /api/v1/inventory/adjustments
 * @desc    Create stock adjustment
 * @access  Private (Branch Manager, Super Admin)
 */
router.post(
  '/adjustments',
  authenticate,
  authorize('Super Admin', 'Branch Manager', 'Warehouse Staff'),
  [
    body('adjustmentDate').notEmpty().isISO8601().withMessage('Valid adjustment date is required'),
    body('items').isArray({ min: 1 }).withMessage('Adjustment items are required'),
  ],
  validate,
  inventoryController.createStockAdjustment
);

/**
 * @route   PUT /api/v1/inventory/adjustments/:id/approve
 * @desc    Approve stock adjustment
 * @access  Private (Branch Manager, Super Admin)
 */
router.put(
  '/adjustments/:id/approve',
  authenticate,
  authorize('Super Admin', 'Branch Manager'),
  inventoryController.approveStockAdjustment
);

/**
 * @route   POST /api/v1/inventory/transfers
 * @desc    Create stock transfer
 * @access  Private (Branch Manager, Super Admin)
 */
router.post(
  '/transfers',
  authenticate,
  authorize('Super Admin', 'Branch Manager', 'Warehouse Staff'),
  [
    body('toBranchId').notEmpty().withMessage('Destination branch is required'),
    body('transferDate').notEmpty().isISO8601().withMessage('Valid transfer date is required'),
    body('items').isArray({ min: 1 }).withMessage('Transfer items are required'),
  ],
  validate,
  inventoryController.createStockTransfer
);

/**
 * @route   PUT /api/v1/inventory/transfers/:id/receive
 * @desc    Receive stock transfer
 * @access  Private (Branch Manager, Super Admin)
 */
router.put(
  '/transfers/:id/receive',
  authenticate,
  authorize('Super Admin', 'Branch Manager', 'Warehouse Staff'),
  [
    body('items').isArray({ min: 1 }).withMessage('Received items are required'),
  ],
  validate,
  inventoryController.receiveStockTransfer
);

module.exports = router;
