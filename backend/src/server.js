/**
 * HARD-POS PRO - Main Server
 * Helvino Technologies Limited
 * Hardware & Building Supplies POS System
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { connectDatabase } = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Initialize express app
const app = express();

// Get port from environment
const PORT = process.env.PORT || 5000;
const API_VERSION = process.env.API_VERSION || 'v1';

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use(`/api/${API_VERSION}`, apiLimiter);

// ============================================================================
// ROUTES
// ============================================================================

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to HARD-POS PRO API',
    version: '1.0.0',
    company: 'Helvino Technologies Limited',
    contact: {
      email: 'helvinotechltd@gmail.com',
      phone: '0703445756',
    },
    documentation: `/api/${API_VERSION}/docs`,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use(`/api/${API_VERSION}`, routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use(errorHandler);

// ============================================================================
// START SERVER
// ============================================================================

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    app.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log('🚀 HARD-POS PRO Server Started');
      console.log('='.repeat(60));
      console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`🔌 API Base: http://localhost:${PORT}/api/${API_VERSION}`);
      console.log(`💼 Company: Helvino Technologies Limited`);
      console.log(`📧 Support: helvinotechltd@gmail.com`);
      console.log(`📱 Phone: 0703445756`);
      console.log('='.repeat(60));
      console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
      console.log('='.repeat(60));
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
