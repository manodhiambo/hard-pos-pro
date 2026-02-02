// User Types
export interface User {
  id: string;
  username: string;
  email?: string;
  fullName: string;
  phone?: string;
  roleId?: string;
  branchId?: string;
  isActive: boolean;
  lastLogin?: string;
  role?: Role;
  branch?: Branch;
}

export interface Role {
  id: string;
  roleName: string;
  description?: string;
  permissions: string[];
}

export interface Branch {
  id: string;
  branchCode: string;
  branchName: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

// Product Types
export interface Product {
  id: string;
  productCode: string;
  barcode?: string;
  productName: string;
  categoryId?: string;
  productType: 'standard' | 'dimensional' | 'serialized' | 'batch' | 'assembly';
  unitOfMeasureId?: string;
  costPrice?: number;
  retailPrice: number;
  tradePrice?: number;
  wholesalePrice?: number;
  markupPercentage?: number;
  trackSerials: boolean;
  trackBatches: boolean;
  trackDimensions: boolean;
  allowFractionalQty: boolean;
  reorderLevel?: number;
  reorderQuantity?: number;
  description?: string;
  brand?: string;
  warrantyMonths?: number;
  isActive: boolean;
  isTaxable: boolean;
  taxRate: number;
  category?: Category;
  unitOfMeasure?: UnitOfMeasure;
  stock?: Stock[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  categoryCode: string;
  categoryName: string;
  description?: string;
  isActive: boolean;
}

export interface UnitOfMeasure {
  id: string;
  unitCode: string;
  unitName: string;
  unitType?: string;
}

export interface Stock {
  id: string;
  productId: string;
  branchId: string;
  locationId?: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  product?: Product;
  branch?: Branch;
  location?: StorageLocation;
}

export interface StorageLocation {
  id: string;
  locationCode: string;
  locationName: string;
  locationType?: string;
}

// Customer Types
export interface Customer {
  id: string;
  customerCode: string;
  customerType: 'retail' | 'contractor' | 'corporate' | 'property_manager';
  customerName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  companyName?: string;
  tradeLicenseNo?: string;
  kraPin?: string;
  physicalAddress?: string;
  city?: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  paymentTerms: number;
  discountTier?: string;
  discountPercentage: number;
  isActive: boolean;
  creditStatus: string;
  totalPurchases: number;
  lastPurchaseDate?: string;
  createdAt: string;
}

// Sale Types
export interface Sale {
  id: string;
  saleNumber: string;
  receiptNumber?: string;
  branchId: string;
  customerId?: string;
  saleDate: string;
  saleType: 'retail' | 'trade' | 'wholesale' | 'special_order' | 'rental';
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus: 'pending' | 'partial' | 'paid';
  amountPaid: number;
  amountDue: number;
  saleStatus: 'draft' | 'completed' | 'cancelled' | 'returned';
  deliveryRequired: boolean;
  deliveryAddress?: string;
  notes?: string;
  customer?: Customer;
  branch?: Branch;
  cashier?: User;
  items?: SaleItem[];
  createdAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  costPrice?: number;
  discountPercentage: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
  product?: Product;
}

// Supplier Types
export interface Supplier {
  id: string;
  supplierCode: string;
  supplierName: string;
  supplierType?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  physicalAddress?: string;
  city?: string;
  paymentTerms: number;
  isActive: boolean;
  createdAt: string;
}

// Purchase Order Types
export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  branchId: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  poStatus: 'draft' | 'sent' | 'partial' | 'received' | 'cancelled';
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  supplier?: Supplier;
  branch?: Branch;
  items?: PurchaseOrderItem[];
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  poId: string;
  productId: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityRemaining: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
  product?: Product;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

// Dashboard Types
export interface DashboardStats {
  todaySales: {
    count: number;
    revenue: number;
  };
  lowStock: {
    count: number;
  };
  pendingPurchaseOrders: {
    count: number;
  };
  customerCredit: {
    customersWithCredit: number;
    totalOutstanding: number;
  };
}

// Form Types
export interface LoginForm {
  username: string;
  password: string;
}

export interface ProductForm {
  productCode: string;
  barcode?: string;
  productName: string;
  categoryId?: string;
  productType: string;
  unitOfMeasureId?: string;
  costPrice?: number;
  retailPrice: number;
  tradePrice?: number;
  wholesalePrice?: number;
  reorderLevel?: number;
  description?: string;
  brand?: string;
  isTaxable: boolean;
  taxRate: number;
}

export interface SaleForm {
  customerId?: string;
  saleType: string;
  items: SaleItemForm[];
  paymentMethod?: string;
  amountPaid?: number;
  notes?: string;
}

export interface SaleItemForm {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
}
