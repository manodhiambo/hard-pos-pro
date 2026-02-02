# HARD-POS PRO API Documentation

Complete API reference for Hardware & Building Supplies POS System

**Base URL:** `http://localhost:5000/api/v1`

---

## Authentication

All protected endpoints require Bearer token authentication.

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGc...",
    "expiresIn": "24h"
  }
}
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer {token}
```

---

## Products

### Get All Products
```http
GET /products?page=1&pageSize=20&search=cement&categoryId=xxx
Authorization: Bearer {token}
```

### Get Product by ID
```http
GET /products/:id
Authorization: Bearer {token}
```

### Get Product by Barcode
```http
GET /products/barcode/:barcode
Authorization: Bearer {token}
```

### Create Product
```http
POST /products
Authorization: Bearer {token}
Content-Type: application/json

{
  "productCode": "PRD001",
  "barcode": "1234567890",
  "productName": "Cement 50kg",
  "categoryId": "xxx",
  "productType": "standard",
  "unitOfMeasureId": "xxx",
  "costPrice": 500,
  "retailPrice": 650,
  "tradePrice": 600,
  "reorderLevel": 100,
  "isTaxable": true,
  "taxRate": 16
}
```

### Update Product
```http
PUT /products/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "retailPrice": 680,
  "reorderLevel": 120
}
```

---

## Sales

### Get All Sales
```http
GET /sales?page=1&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

### Get Today's Sales
```http
GET /sales/today
Authorization: Bearer {token}
```

### Create Sale
```http
POST /sales
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "xxx",
  "saleType": "retail",
  "items": [
    {
      "productId": "xxx",
      "quantity": 2,
      "unitPrice": 650,
      "discountPercentage": 0
    }
  ],
  "paymentMethod": "cash",
  "amountPaid": 1300
}
```

### Cancel Sale
```http
PUT /sales/:id/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Customer request"
}
```

---

## Customers

### Get All Customers
```http
GET /customers?page=1&search=john&customerType=contractor
Authorization: Bearer {token}
```

### Create Customer
```http
POST /customers
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerType": "contractor",
  "customerName": "John's Construction",
  "contactPerson": "John Doe",
  "phone": "0712345678",
  "email": "john@example.com",
  "creditLimit": 100000,
  "discountTier": "silver",
  "discountPercentage": 5
}
```

### Get Customer Statement
```http
GET /customers/:id/statement?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

---

## Inventory

### Get Stock
```http
GET /inventory/stock?branchId=xxx&belowReorderLevel=true
Authorization: Bearer {token}
```

### Get Stock Movements
```http
GET /inventory/movements?productId=xxx&movementType=sale
Authorization: Bearer {token}
```

### Create Stock Adjustment
```http
POST /inventory/adjustments
Authorization: Bearer {token}
Content-Type: application/json

{
  "adjustmentDate": "2024-01-15",
  "adjustmentType": "count_correction",
  "reason": "Physical count",
  "items": [
    {
      "productId": "xxx",
      "locationId": "xxx",
      "currentQuantity": 100,
      "countedQuantity": 98,
      "unitCost": 500
    }
  ]
}
```

### Approve Stock Adjustment
```http
PUT /inventory/adjustments/:id/approve
Authorization: Bearer {token}
```

### Create Stock Transfer
```http
POST /inventory/transfers
Authorization: Bearer {token}
Content-Type: application/json

{
  "toBranchId": "xxx",
  "transferDate": "2024-01-15",
  "vehicleNumber": "KAB 123C",
  "driverName": "Peter",
  "items": [
    {
      "productId": "xxx",
      "quantitySent": 50,
      "fromLocationId": "xxx"
    }
  ]
}
```

---

## Suppliers

### Get All Suppliers
```http
GET /suppliers?search=cement&supplierType=manufacturer
Authorization: Bearer {token}
```

### Create Supplier
```http
POST /suppliers
Authorization: Bearer {token}
Content-Type: application/json

{
  "supplierName": "Bamburi Cement",
  "supplierType": "manufacturer",
  "contactPerson": "Sales Manager",
  "phone": "0700000000",
  "email": "sales@bamburi.com",
  "paymentTerms": 30
}
```

---

## Purchase Orders

### Get All Purchase Orders
```http
GET /purchase-orders?supplierId=xxx&poStatus=sent
Authorization: Bearer {token}
```

### Create Purchase Order
```http
POST /purchase-orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "supplierId": "xxx",
  "orderDate": "2024-01-15",
  "expectedDeliveryDate": "2024-01-20",
  "items": [
    {
      "productId": "xxx",
      "quantityOrdered": 100,
      "unitPrice": 500,
      "taxRate": 16
    }
  ],
  "shippingCost": 5000
}
```

### Approve Purchase Order
```http
PUT /purchase-orders/:id/approve
Authorization: Bearer {token}
```

### Create Goods Receipt
```http
POST /purchase-orders/goods-receipts
Authorization: Bearer {token}
Content-Type: application/json

{
  "poId": "xxx",
  "supplierId": "xxx",
  "receiptDate": "2024-01-20",
  "supplierInvoiceNo": "INV-001",
  "items": [
    {
      "poItemId": "xxx",
      "productId": "xxx",
      "quantityReceived": 100,
      "quantityAccepted": 98,
      "locationId": "xxx",
      "qualityStatus": "approved"
    }
  ]
}
```

---

## Users

### Get All Users
```http
GET /users?roleId=xxx&branchId=xxx
Authorization: Bearer {token}
```

### Create User
```http
POST /users
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "cashier1",
  "password": "secure123",
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "0712345678",
  "roleId": "xxx",
  "branchId": "xxx"
}
```

### Reset User Password
```http
PUT /users/:id/reset-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "newPassword": "newsecure123"
}
```

---

## Reports

### Dashboard Statistics
```http
GET /reports/dashboard
Authorization: Bearer {token}
```

### Sales Report
```http
GET /reports/sales?startDate=2024-01-01&endDate=2024-12-31&branchId=xxx
Authorization: Bearer {token}
```

### Inventory Report
```http
GET /reports/inventory?branchId=xxx&categoryId=xxx
Authorization: Bearer {token}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ],
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

---

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## Rate Limiting

- General API: 100 requests per 15 minutes per IP
- Authentication: 5 login attempts per 15 minutes per IP
- Create operations: 20 requests per minute per IP

---

**Helvino Technologies Limited**  
Email: helvinotechltd@gmail.com  
Phone: 0703445756
