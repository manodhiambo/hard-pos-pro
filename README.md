# HARD-POS PRO
## Hardware & Building Supplies Point of Sale System

**Developed by:** Helvino Technologies Limited  
**Contact:** helvinotechltd@gmail.com | 0703445756

---

## 🎯 Overview

HARD-POS PRO is a comprehensive, industrial-grade Point of Sale and Inventory Management System specifically engineered for hardware stores, building material suppliers, and industrial tool retailers in Kenya.

### Key Features

✅ **Dimensional Product Handling** - Sell by length, weight, area, or pieces  
✅ **Serial Number Tracking** - Full warranty management for tools  
✅ **Cut-to-Size Operations** - Manage custom cuts with waste tracking  
✅ **Contractor Accounts** - Credit management for trade customers  
✅ **Multi-Unit Support** - Meters, kilograms, liters, square meters  
✅ **Batch/Lot Tracking** - Expiry dates for chemicals and paints  
✅ **Tool Rental Management** - Complete rental lifecycle  
✅ **M-Pesa Integration** - Kenya mobile payments  
✅ **LPO Processing** - Corporate purchase orders  
✅ **Inter-Branch Transfers** - Multi-location inventory  

---

## 📋 Prerequisites

- **Node.js** v16 or higher
- **PostgreSQL** 13 or higher (or Neon account)
- **npm** or **yarn**
- **Git**

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd hard-pos-pro
```

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Copy environment file
cp .env.example .env

# Edit .env and add your database URL
nano .env  # or use your preferred editor

# Install dependencies and setup database
cd ..
chmod +x install-backend.sh
./install-backend.sh
```

### 3. Start Development Server
```bash
cd backend
npm run dev
```

The API will be available at `http://localhost:5000`

---

## 📦 Project Structure
```
hard-pos-pro/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── salesController.js
│   │   │   └── customerController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── validate.js
│   │   │   └── rateLimiter.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── salesRoutes.js
│   │   │   ├── customerRoutes.js
│   │   │   └── index.js
│   │   ├── utils/
│   │   │   ├── helpers.js
│   │   │   ├── validators.js
│   │   │   ├── response.js
│   │   │   └── logger.js
│   │   └── server.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── README.md
├── frontend/ (to be developed)
├── install-backend.sh
└── README.md
```

---

## 🔐 Default Credentials

After installation, use these credentials:

- **Username:** `admin`
- **Password:** `admin123`

⚠️ **IMPORTANT:** Change these credentials immediately after first login!

---

## 🛠️ Development

### Run Development Server
```bash
cd backend
npm run dev
```

### View Database
```bash
cd backend
npm run prisma:studio
```

This opens Prisma Studio at `http://localhost:5555`

### Create Database Migration
```bash
cd backend
npm run prisma:migrate
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Key Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get current user

#### Products
- `GET /products` - List all products
- `GET /products/:id` - Get product details
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `GET /products/barcode/:barcode` - Find by barcode

#### Sales
- `GET /sales` - List all sales
- `GET /sales/today` - Today's sales
- `POST /sales` - Create new sale
- `GET /sales/:id` - Get sale details

#### Customers
- `GET /customers` - List all customers
- `POST /customers` - Create customer
- `GET /customers/:id/statement` - Customer statement

---

## 🗄️ Database Schema

The system includes:

- **Products** - Standard, dimensional, serialized, batch, assembly
- **Inventory** - Stock, locations, movements, adjustments
- **Sales** - POS, items, payments, returns
- **Customers** - Retail, contractor, corporate accounts
- **Suppliers** - Purchase orders, goods receipts
- **Users** - Role-based access control
- **Audit** - Complete activity and change tracking

---

## 🔧 Configuration

### Environment Variables
```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database"

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000

# Company
COMPANY_NAME="Your Hardware Store"
COMPANY_EMAIL=info@yourstore.com
COMPANY_PHONE=0700000000
```

---

## 📱 Hardware Integration (Future)

The system is designed to integrate with:

- Barcode scanners (1D/2D)
- Receipt printers (ESC/POS)
- Digital weighing scales
- Label printers
- Cash drawers
- Biometric devices

---

## 🚢 Deployment

### Production Checklist

1. Update `.env` with production values
2. Set `NODE_ENV=production`
3. Use production PostgreSQL database
4. Enable HTTPS
5. Setup proper CORS origins
6. Configure backup strategy
7. Setup monitoring and logging
8. Change default admin password

### Recommended Hosting

- **Backend:** Render, Railway, or DigitalOcean
- **Database:** Neon, Supabase, or AWS RDS
- **Frontend:** Vercel or Netlify

---

## 🤝 Support & Contact

**Helvino Technologies Limited**

- 📧 Email: helvinotechltd@gmail.com
- 📱 Phone: 0703445756
- 🌐 Website: [Coming Soon]

### Business Hours
Monday - Friday: 8:00 AM - 6:00 PM EAT  
Saturday: 9:00 AM - 2:00 PM EAT  
Sunday: Closed

---

## 📄 License

Copyright © 2024 Helvino Technologies Limited

---

## 🙏 Acknowledgments

Built specifically for the Kenyan hardware retail market, supporting:
- M-Pesa payments
- KRA eTIMS compliance
- Local business practices
- Multi-currency support

---

**Building Reliable Digital Foundation**

Helvino Technologies Limited
