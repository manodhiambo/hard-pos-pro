/**
 * Product Routes
 * Helvino Technologies Limited
 */

const express = require('express');
const { body, query } = require('express-validator');
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @route   GET /api/v1/products
 * @desc    Get all products with pagination
 * @access  Private
 */
router.get('/', authenticate, productController.getAllProducts);

/**
 * @route   GET /api/v1/products/low-stock
 * @desc    Get low stock products
 * @access  Private
 */
router.get('/low-stock', authenticate, productController.getLowStockProducts);

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get product by ID
 * @access  Private
 */
router.get('/:id', authenticate, productController.getProductById);

/**
 * @route   GET /api/v1/products/barcode/:barcode
 * @desc    Get product by barcode
 * @access  Private
 */
router.get('/barcode/:barcode', authenticate, productController.getProductByBarcode);

/**
 * @route   GET /api/v1/products/:id/stock
 * @desc    Get product stock summary
 * @access  Private
 */
router.get('/:id/stock', authenticate, productController.getProductStock);

/**
 * @route   POST /api/v1/products
 * @desc    Create new product
 * @access  Private (Branch Manager, Super Admin)
 */
router.post(
  '/',
  authenticate,
  authorize('Super Admin', 'Branch Manager'),
  createLimiter,
  [
    body('productCode').notEmpty().withMessage('Product code is required'),
    body('productName').notEmpty().withMessage('Product name is required'),
    body('productType')
      .notEmpty()
      .isIn(['standard', 'dimensional', 'serialized', 'batch', 'assembly'])
      .withMessage('Valid product type is required'),
    body('retailPrice')
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage('Valid retail price is required'),
  ],
  validate,
  productController.createProduct
);

/**
 * @route   PUT /api/v1/products/:id
 * @desc    Update product
 * @access  Private (Branch Manager, Super Admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize('Super Admin', 'Branch Manager'),
  productController.updateProduct
);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete product (soft delete)
 * @access  Private (Super Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('Super Admin'),
  productController.deleteProduct
);

/**
 * @route   POST /api/v1/products/bulk-import
 * @desc    Bulk import products
 * @access  Private (Super Admin, Branch Manager)
 */
router.post(
  '/bulk-import',
  authenticate,
  authorize('Super Admin', 'Branch Manager'),
  [
    body('products').isArray({ min: 1 }).withMessage('Products array is required'),
  ],
  validate,
  productController.bulkImportProducts
);

module.exports = router;
