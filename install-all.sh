#!/bin/bash

echo "=========================================================="
echo "HARD-POS PRO - Complete Installation"
echo "Hardware & Building Supplies POS System"
echo "Helvino Technologies Limited"
echo "=========================================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js v16 or higher from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install backend
echo "=================================================="
echo "📦 Installing Backend..."
echo "=================================================="
./install-backend.sh

if [ $? -ne 0 ]; then
    echo "❌ Backend installation failed"
    exit 1
fi

echo ""
echo "=================================================="
echo "📦 Installing Frontend..."
echo "=================================================="
./install-frontend.sh

if [ $? -ne 0 ]; then
    echo "❌ Frontend installation failed"
    exit 1
fi

echo ""
echo "=========================================================="
echo "🎉 Installation Complete!"
echo "=========================================================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Update backend/.env with your database URL"
echo "2. Update frontend/.env.local if needed"
echo ""
echo "3. Start Backend:"
echo "   cd backend && npm run dev"
echo "   (Runs on http://localhost:5000)"
echo ""
echo "4. Start Frontend (in new terminal):"
echo "   cd frontend && npm run dev"
echo "   (Runs on http://localhost:3000)"
echo ""
echo "=========================================================="
echo "📧 Support: helvinotechltd@gmail.com"
echo "📱 Phone: 0703445756"
echo "=========================================================="

