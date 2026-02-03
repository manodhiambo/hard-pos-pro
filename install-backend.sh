#!/bin/bash

echo "=================================================="
echo "HARD-POS PRO Backend Installation"
echo "Helvino Technologies Limited"
echo "=================================================="
echo ""

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

echo "✅ Prisma Client generated successfully"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Please create one from .env.example"
    echo "📝 Copy .env.example to .env and update with your settings"
    exit 1
fi

# Push schema to database
echo "🗄️  Pushing schema to database..."
npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Failed to push schema to database"
    echo "Please check your DATABASE_URL in .env"
    exit 1
fi

echo "✅ Database schema created successfully"
echo ""

# Seed database
echo "🌱 Seeding database with initial data..."
node prisma/seed.js

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi

echo ""
echo "=================================================="
echo "✅ Installation completed successfully!"
echo "=================================================="
echo ""
echo "🚀 To start the development server:"
echo "   npm run dev"
echo ""
echo "📝 Default Admin Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "⚠️  Please change the default password after first login!"
echo ""
echo "📧 Support: helvinotechltd@gmail.com"
echo "📱 Phone: 0703445756"
echo "=================================================="

