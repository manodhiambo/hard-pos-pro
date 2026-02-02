/**
 * Supplier Routes
 * Helvino Technologies Limited
 */

const express = require('express');
const { body } = require('express-validator');
const supplierController = require('../controllers/supplierController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @route   GET /api/v1/suppliers
 * @desc    Get all suppliers
 * @access  Private
 */
router.get('/', authenticate, supplierController.getAllSuppliers);

/**
 * @route   GET /api/v1/suppliers/:id
 * @desc    Get supplier by ID
 * @access  Private
 */
router.get('/:id', authenticate, supplierController.getSupplierById);

/**
 * @route   POST /api/v1/suppliers
 * @desc    Create supplier
 * @access  Private (Branch Manager, Super Admin)
 */
router.post(
  '/',
  authenticate,
  authorize('Super Admin', 'Branch Manager'),
  createLimiter,
  [
    body('supplierName').notEmpty().withMessage('Supplier name is required'),
  ],
  validate,
  supplierController.createSupplier
);

/**
 * @route   PUT /api/v1/suppliers/:id
 * @desc    Update supplier
 * @access  Private (Branch Manager, Super Admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize('Super Admin', 'Branch Manager'),
  supplierController.updateSupplier
);

module.exports = router;
