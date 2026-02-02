#!/bin/bash

echo "=================================================="
echo "HARD-POS PRO Quick Start"
echo "Helvino Technologies Limited"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js v16 or higher from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ backend directory not found!"
    echo "Please make sure you're in the project root directory"
    exit 1
fi

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  .env file not found!"
    echo ""
    echo "Creating .env from .env.example..."
    cp backend/.env.example backend/.env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit backend/.env and update:"
    echo "   - DATABASE_URL with your PostgreSQL connection string"
    echo "   - JWT_SECRET with a random secure string"
    echo "   - Company details"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Run installation
echo "🚀 Starting installation..."
echo ""
./install-backend.sh

if [ $? -eq 0 ]; then
    echo ""
    echo "=================================================="
    echo "✅ Setup Complete! Ready to start."
    echo "=================================================="
    echo ""
    echo "To start the server, run:"
    echo "   cd backend && npm run dev"
    echo ""
    echo "Or run: ./start-server.sh"
    echo "=================================================="
fi

