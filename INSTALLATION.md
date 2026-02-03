# HARD-POS PRO - Complete Installation Guide

**Hardware & Building Supplies Point of Sale System**  
**Helvino Technologies Limited**

---

## 📋 System Requirements

- **Node.js** v16 or higher
- **PostgreSQL** 13+ (or Neon account)
- **npm** or **yarn**
- **8GB RAM** minimum
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

---

## 🚀 Quick Installation

### Option 1: Automated Installation (Recommended)
```bash
# Run the master installation script
./install-all.sh
```

This will:
1. Install all backend dependencies
2. Setup database schema
3. Seed initial data
4. Install frontend dependencies
5. Configure environment files

### Option 2: Manual Installation

#### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env and add your database URL
nano .env

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database
node prisma/seed.js
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit if needed (default should work)
nano .env.local
```

---

## 🗄️ Database Setup

### Option 1: Using Neon (Recommended - Free PostgreSQL)

1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Update `backend/.env`:
```
   DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

### Option 2: Local PostgreSQL
```bash
# Create database
createdb hardpos_db

# Update backend/.env
DATABASE_URL="postgresql://postgres:password@localhost:5432/hardpos_db"
```

---

## ▶️ Running the Application

### Start Backend
```bash
cd backend
npm run dev
```

Backend runs on: **http://localhost:5000**

### Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```

Frontend runs on: **http://localhost:3000**

---

## 🔐 Default Login Credentials

After installation, use these credentials:

- **Username:** `admin`
- **Password:** `admin123`

⚠️ **IMPORTANT:** Change these immediately after first login!

---

## 🧪 Testing the API
```bash
cd backend
./test-api.sh
```

Or manually:
```bash
curl http://localhost:5000/api/v1/health
```

---

## 🔧 Hardware Integration

### Supported Devices

1. **Barcode Scanners**
   - 1D/2D scanners via USB (HID mode)
   - Automatic barcode detection

2. **Receipt Printers**
   - ESC/POS compatible printers
   - Thermal printers (Epson TM-T88, etc.)
   - USB or Network connection

3. **Digital Weighing Scales**
   - Serial/USB scales
   - Automatic weight capture

4. **Label Printers**
   - Zebra ZPL compatible
   - Barcode label printing

5. **Cash Drawers**
   - RJ11/RJ12 connection
   - Automatic opening on cash sales

6. **Biometric Devices**
   - Fingerprint scanners
   - User authentication

### Hardware Configuration

Access hardware settings in:  
**Settings → Hardware Integration**

---

## 📱 Features Overview

### Core Features
- ✅ Point of Sale (POS)
- ✅ Product Management
- ✅ Inventory Tracking
- ✅ Customer Management
- ✅ Sales Reports
- ✅ Purchase Orders
- ✅ Supplier Management
- ✅ Multi-branch Support

### Hardware Features
- ✅ Barcode Scanning
- ✅ Receipt Printing
- ✅ Weight Capture
- ✅ Label Printing
- ✅ Cash Drawer Control
- ✅ Biometric Auth

### Specialized Features
- ✅ Cut-to-Size Operations
- ✅ Serial Number Tracking
- ✅ Batch/Lot Tracking
- ✅ Dimensional Products
- ✅ Tool Rental Management
- ✅ Contractor Credit
- ✅ M-Pesa Integration (Ready)

---

## 📂 Project Structure
```
hard-pos-pro/
├── backend/               # Node.js/Express API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Auth, validation
│   │   └── utils/         # Helpers
│   ├── prisma/           # Database schema
│   └── package.json
├── frontend/             # Next.js React app
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── services/     # API clients
│   │   ├── store/        # State management
│   │   └── utils/        # Helpers
│   └── package.json
└── README.md
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is available
lsof -i :5000

# Check database connection
cd backend
npx prisma studio
```

### Frontend won't start
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules .next
npm install
```

### Database connection failed

1. Verify DATABASE_URL in `backend/.env`
2. Check if database is running
3. Test connection with `psql` or pgAdmin

### Hardware not detecting

1. Check USB connections
2. Verify device drivers installed
3. Check browser permissions (Web Serial API)
4. Review hardware settings in app

---

## 📊 Default Data

After seeding, you'll have:

- 1 Admin user
- 5 User roles
- 6 Product categories
- 14 Units of measure
- 5 Expense categories
- 1 Main branch
- 1 Cash register
- System settings

---

## 🔄 Updates & Maintenance

### Update Database Schema
```bash
cd backend
npx prisma db push
```

### Backup Database
```bash
pg_dump hardpos_db > backup.sql
```

### View Database
```bash
cd backend
npx prisma studio
```

Opens at: http://localhost:5555

---

## 🆘 Support

**Helvino Technologies Limited**

- 📧 Email: helvinotechltd@gmail.com
- 📱 Phone: 0703445756
- 🌐 Location: Nairobi, Kenya

**Business Hours:**
- Monday - Friday: 8:00 AM - 6:00 PM EAT
- Saturday: 9:00 AM - 2:00 PM EAT
- Sunday: Closed

---

## 📄 License

Copyright © 2024 Helvino Technologies Limited

---

## 🙏 Thank You

Thank you for choosing HARD-POS PRO!

**Building Reliable Digital Foundation**

---
