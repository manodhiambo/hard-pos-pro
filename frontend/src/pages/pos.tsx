import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import Head from 'next/head';
import {
  FiSearch,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiShoppingCart,
  FiUser,
  FiDollarSign,
  FiPrinter,
} from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import { productService } from '../services/product.service';
import { customerService } from '../services/customer.service';
import { saleService } from '../services/sale.service';
import { useCartStore } from '../store/cartStore';
import { hardwareService } from '../services/hardware.service';
import { formatCurrency, parseDecimal } from '../utils/format';
import { Product, Customer } from '../types';
import toast from 'react-hot-toast';

export default function POS() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    updateDiscount,
    clearCart,
    getSubtotal,
    getDiscount,
    getTax,
    getTotal,
  } = useCartStore();

  // Search products
  const { data: productsData, refetch: searchProducts } = useQuery(
    ['products-search', searchQuery],
    () => productService.getAll({ search: searchQuery, pageSize: 10, isActive: true }),
    {
      enabled: searchQuery.length > 2,
      onError: (error: any) => {
        toast.error('Failed to search products');
      },
    }
  );

  // Search customers
  const { data: customersData } = useQuery(
    'customers-active',
    () => customerService.getAll({ isActive: true, pageSize: 100 }),
    {
      onError: (error: any) => {
        console.error('Failed to load customers');
      },
    }
  );

  // Listen for barcode scanner
  useEffect(() => {
    const unsubscribe = hardwareService.onBarcodeScanned(async (barcode) => {
      try {
        const product = await productService.getByBarcode(barcode);
        addItem(product, 1);
        toast.success(`${product.productName} added to cart`);
        setSearchQuery('');
      } catch (error) {
        toast.error('Product not found');
      }
    });

    return unsubscribe;
  }, [addItem]);

  const handleAddProduct = (product: Product) => {
    addItem(product, 1);
    toast.success(`${product.productName} added`);
    setSearchQuery('');
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleCompleteSale = async () => {
    if (!paymentMethod) {
      toast.error('Please select payment method');
      return;
    }

    const paidAmount = parseFloat(amountPaid) || 0;
    const total = getTotal();

    if (paymentMethod !== 'credit' && paidAmount < total) {
      toast.error('Insufficient payment amount');
      return;
    }

    setIsProcessing(true);

    try {
      const saleData = {
        customerId: selectedCustomer?.id,
        saleType: selectedCustomer?.customerType === 'contractor' ? 'trade' : 'retail',
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercentage: item.discountPercentage,
        })),
        paymentMethod,
        amountPaid: paidAmount,
      };

      const sale = await saleService.create(saleData);

      // Print receipt
      try {
        await hardwareService.printReceipt({
          sale,
          company: {
            name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Hardware Store',
            address: 'Nairobi, Kenya',
            phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '0703445756',
            email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'info@store.com',
          },
          items: sale.items || items,
        });
      } catch (printError) {
        console.error('Print error:', printError);
      }

      // Open cash drawer if cash payment
      if (paymentMethod === 'cash') {
        try {
          await hardwareService.openCashDrawer();
        } catch (drawerError) {
          console.error('Cash drawer error:', drawerError);
        }
      }

      toast.success('Sale completed successfully!');
      clearCart();
      setSelectedCustomer(null);
      setPaymentMethod('cash');
      setAmountPaid('');
      setShowPaymentModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete sale');
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const tax = getTax();
  const total = getTotal();
  const change = parseFloat(amountPaid || '0') - total;

  return (
    <>
      <Head>
        <title>Point of Sale - HARD-POS PRO</title>
      </Head>

      <Layout>
        <div className="h-[calc(100vh-8rem)] flex gap-4">
          {/* Left side - Product search and selection */}
          <div className="flex-1 flex flex-col space-y-4">
            {/* Search bar */}
            <div className="card">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products by name, code, or scan barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                  autoFocus
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>

              {/* Search results */}
              {searchQuery.length > 2 && productsData && (
                <div className="mt-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-2">
                    {productsData.data.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleAddProduct(product)}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200 text-left"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{product.productName}</p>
                          <p className="text-sm text-gray-500">{product.productCode}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(product.retailPrice)}
                          </p>
                          {product.stock && product.stock.length > 0 && (
                            <p className="text-xs text-gray-500">
                              Stock: {parseDecimal(product.stock[0].availableQuantity).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cart items */}
            <div className="card flex-1 overflow-hidden flex flex-col">
              <h3 className="text-lg font-semibold mb-4">Cart Items ({items.length})</h3>
              
              <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <FiShoppingCart className="w-16 h-16 mb-4" />
                    <p>Cart is empty</p>
                    <p className="text-sm">Scan or search for products</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.product.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.product.productName}</p>
                            <p className="text-sm text-gray-500">{item.product.productCode}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Quantity controls */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            >
                              <FiMinus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.product.id, parseFloat(e.target.value) || 0)
                              }
                              className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                              min="0"
                              step={item.product.allowFractionalQty ? '0.1' : '1'}
                            />
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            >
                              <FiPlus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {formatCurrency(item.unitPrice)} × {item.quantity}
                            </p>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(item.quantity * item.unitPrice)}
                            </p>
                          </div>
                        </div>

                        {/* Discount */}
                        <div className="mt-2">
                          <label className="text-xs text-gray-600">Discount %:</label>
                          <input
                            type="number"
                            value={item.discountPercentage}
                            onChange={(e) =>
                              updateDiscount(item.product.id, parseFloat(e.target.value) || 0)
                            }
                            className="w-20 text-sm border border-gray-300 rounded px-2 py-1 ml-2"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Customer info and totals */}
          <div className="w-96 flex flex-col space-y-4">
            {/* Customer selection */}
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Customer</label>
                <button
                  onClick={() => setShowCustomerModal(true)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Select
                </button>
              </div>
              {selectedCustomer ? (
                <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{selectedCustomer.customerName}</p>
                      <p className="text-sm text-gray-500">{selectedCustomer.customerCode}</p>
                      {selectedCustomer.customerType === 'contractor' && (
                        <p className="text-xs text-primary-600 mt-1">
                          Trade Price Applied
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg text-center text-gray-500">
                  <FiUser className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Walk-in Customer</p>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="card flex-1">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span className="font-medium">-{formatCurrency(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Tax (16%):</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleCheckout}
                  disabled={items.length === 0}
                  className="w-full btn btn-primary py-3 text-lg flex items-center justify-center"
                >
                  <FiDollarSign className="mr-2" />
                  Checkout
                </button>
                
                <button
                  onClick={clearCart}
                  disabled={items.length === 0}
                  className="w-full btn btn-secondary py-2"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customer selection modal */}
        {showCustomerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Select Customer</h2>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-2">
                  {customersData?.data.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowCustomerModal(false);
                      }}
                      className="w-full p-4 text-left hover:bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <p className="font-medium text-gray-900">{customer.customerName}</p>
                      <p className="text-sm text-gray-500">{customer.customerCode}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
                          {customer.customerType}
                        </span>
                        {customer.phone && (
                          <span className="text-xs text-gray-500">{customer.phone}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="w-full btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Payment</h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Total amount */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(total)}</p>
                </div>

                {/* Payment method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['cash', 'mpesa', 'card', 'credit'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium ${
                          paymentMethod === method
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {method.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount paid */}
                {paymentMethod !== 'credit' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount Paid
                    </label>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="0.00"
                      className="input"
                      autoFocus
                    />
                  </div>
                )}

                {/* Change */}
                {change > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 mb-1">Change</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(change)}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isProcessing}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteSale}
                  disabled={isProcessing}
                  className="flex-1 btn btn-success flex items-center justify-center"
                >
                  {isProcessing ? (
                    'Processing...'
                  ) : (
                    <>
                      <FiPrinter className="mr-2" />
                      Complete & Print
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}

// Disable static generation for authenticated pages
export async function getServerSideProps() {
  return {
    props: {},
  };
}
