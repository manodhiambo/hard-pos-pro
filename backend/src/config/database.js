const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
  errorFormat: 'pretty',
});

// Test database connection
const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown
const disconnectDatabase = async () => {
  await prisma.$disconnect();
  console.log('Database disconnected');
};

process.on('beforeExit', async () => {
  await disconnectDatabase();
});

module.exports = { prisma, connectDatabase, disconnectDatabase };
