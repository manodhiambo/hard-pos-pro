/**
 * Purchase Order Routes
 * Helvino Technologies Limited
 */

const express = require('express');
const { body } = require('express-validator');
const purchaseOrderController = require('../controllers/purchaseOrderController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @route   GET /api/v1/purchase-orders
 * @desc    Get all purchase orders
 * @access  Private
 */
router.get('/', authenticate, purchaseOrderController.getAllPurchaseOrders);

/**
 * @route   GET /api/v1/purchase-orders/:id
 * @desc    Get purchase order by ID
 * @access  Private
 */
router.get('/:id', authenticate, purchaseOrderController.getPurchaseOrderById);

/**
 * @route   POST /api/v1/purchase-orders
 * @desc    Create purchase order
 * @access  Private (Branch Manager, Super Admin)
 */
router.post(
  '/',
  authenticate,
  authorize('Super Admin', 'Branch Manager'),
  [
    body('supplierId').notEmpty().withMessage('Supplier is required'),
    body('orderDate').notEmpty().isISO8601().withMessage('Valid order date is required'),
    body('items').isArray({ min: 1 }).withMessage('Purchase order items are required'),
  ],
  validate,
  purchaseOrderController.createPurchaseOrder
);

/**
 * @route   PUT /api/v1/purchase-orders/:id/approve
 * @desc    Approve purchase order
 * @access  Private (Branch Manager, Super Admin)
 */
router.put(
  '/:id/approve',
  authenticate,
  authorize('Super Admin', 'Branch Manager'),
  purchaseOrderController.approvePurchaseOrder
);

/**
 * @route   POST /api/v1/purchase-orders/goods-receipts
 * @desc    Create goods receipt
 * @access  Private (Warehouse Staff, Branch Manager, Super Admin)
 */
router.post(
  '/goods-receipts',
  authenticate,
  authorize('Super Admin', 'Branch Manager', 'Warehouse Staff'),
  [
    body('supplierId').notEmpty().withMessage('Supplier is required'),
    body('receiptDate').notEmpty().isISO8601().withMessage('Valid receipt date is required'),
    body('items').isArray({ min: 1 }).withMessage('Receipt items are required'),
  ],
  validate,
  purchaseOrderController.createGoodsReceipt
);

module.exports = router;
