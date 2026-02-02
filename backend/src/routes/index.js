/**
 * Main Routes Index
 * Helvino Technologies Limited
 */

const express = require('express');
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const salesRoutes = require('./salesRoutes');
const customerRoutes = require('./customerRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const supplierRoutes = require('./supplierRoutes');
const purchaseOrderRoutes = require('./purchaseOrderRoutes');
const userRoutes = require('./userRoutes');
const reportRoutes = require('./reportRoutes');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'HARD-POS PRO API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    company: 'Helvino Technologies Limited',
  });
});

// System information
router.get('/info', (req, res) => {
  res.json({
    success: true,
    application: 'HARD-POS PRO',
    description: 'Hardware & Building Supplies POS System',
    version: '1.0.0',
    company: {
      name: 'Helvino Technologies Limited',
      email: 'helvinotechltd@gmail.com',
      phone: '0703445756',
      tagline: 'Building Reliable Digital Foundation',
    },
    features: [
      'Product Management (Standard, Dimensional, Serialized, Batch)',
      'Sales & POS',
      'Inventory Management',
      'Customer Management (Retail, Contractor, Corporate)',
      'Supplier & Purchase Orders',
      'Stock Transfers',
      'Cut-to-Size Operations',
      'Tool Rentals',
      'M-Pesa Integration Ready',
      'Comprehensive Reporting',
    ],
    endpoints: {
      auth: '/api/v1/auth',
      products: '/api/v1/products',
      sales: '/api/v1/sales',
      customers: '/api/v1/customers',
      inventory: '/api/v1/inventory',
      suppliers: '/api/v1/suppliers',
      purchaseOrders: '/api/v1/purchase-orders',
      users: '/api/v1/users',
      reports: '/api/v1/reports',
    },
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/sales', salesRoutes);
router.use('/customers', customerRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/users', userRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
