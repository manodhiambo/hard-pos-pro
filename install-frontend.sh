#!/bin/bash

echo "=================================================="
echo "HARD-POS PRO Frontend Installation"
echo "Helvino Technologies Limited"
echo "=================================================="
echo ""

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local file not found. Copying from .env.example..."
    cp .env.example .env.local
    echo "✅ .env.local created"
    echo ""
    echo "⚠️  Please update .env.local with your backend API URL"
fi

echo "=================================================="
echo "✅ Frontend installation completed!"
echo "=================================================="
echo ""
echo "🚀 To start the development server:"
echo "   cd frontend && npm run dev"
echo ""
echo "📝 The app will be available at http://localhost:3000"
echo ""
echo "=================================================="

