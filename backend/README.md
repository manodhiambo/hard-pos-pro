# HARD-POS PRO Backend

Hardware & Building Supplies POS System - Backend API

**Developed by:** Helvino Technologies Limited  
**Contact:** helvinotechltd@gmail.com | 0703445756

## Features

- Complete REST API for Hardware POS System
- Authentication & Authorization with JWT
- Product Management (Standard, Dimensional, Serialized, Batch)
- Sales & POS Operations
- Inventory Management
- Customer Management (Retail, Contractor, Corporate)
- Supplier & Purchase Order Management
- Stock Transfers (Inter-branch)
- Payment Processing (Cash, M-Pesa, Card, Credit)
- Tool Rental Management
- Cutting Operations & Waste Tracking
- Comprehensive Reporting
- Audit Logs & Activity Tracking

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** express-validator
- **Security:** helmet, cors, bcryptjs

## Installation

1. **Install dependencies:**
```bash
   npm install
```

2. **Setup environment variables:**
```bash
   cp .env.example .env
   # Edit .env with your database URL and other settings
```

3. **Setup database:**
```bash
   # Generate Prisma Client
   npm run prisma:generate

   # Push schema to database
   npm run prisma:push

   # Seed database with initial data
   npm run prisma:seed
```

4. **Start development server:**
```bash
   npm run dev
```

## Environment Variables
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/change-password` - Change password

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get product by ID
- `GET /api/v1/products/barcode/:barcode` - Get product by barcode
- `POST /api/v1/products` - Create product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

### Sales
- `GET /api/v1/sales` - Get all sales
- `GET /api/v1/sales/:id` - Get sale by ID
- `GET /api/v1/sales/today` - Get today's sales
- `POST /api/v1/sales` - Create sale
- `PUT /api/v1/sales/:id/cancel` - Cancel sale

### Customers
- `GET /api/v1/customers` - Get all customers
- `GET /api/v1/customers/:id` - Get customer by ID
- `GET /api/v1/customers/:id/statement` - Get customer statement
- `POST /api/v1/customers` - Create customer
- `PUT /api/v1/customers/:id` - Update customer

## Default Credentials

After seeding:
- **Username:** admin
- **Password:** admin123

⚠️ **Change these credentials immediately after first login!**

## Database Schema

The system uses a comprehensive schema with the following main tables:
- Users & Roles
- Products & Categories
- Stock & Inventory
- Sales & Sale Items
- Customers & Suppliers
- Purchase Orders
- Payments
- And more...

## Development
```bash
# Run in development mode with auto-reload
npm run dev

# View database in Prisma Studio
npm run prisma:studio

# Create new migration
npm run prisma:migrate
```

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Update `DATABASE_URL` with production database
3. Run migrations: `npm run prisma:migrate`
4. Start server: `npm start`

## Support

For technical support:
- **Email:** helvinotechltd@gmail.com
- **Phone:** 0703445756

---

**Building Reliable Digital Foundation**
