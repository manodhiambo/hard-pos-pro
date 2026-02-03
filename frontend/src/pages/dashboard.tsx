import { useEffect } from 'react';
import { useQuery } from 'react-query';
import Head from 'next/head';
import Link from 'next/link';
import {
  FiDollarSign,
  FiShoppingCart,
  FiAlertCircle,
  FiTrendingUp,
  FiUsers,
  FiPackage,
  FiArrowRight,
} from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import { dashboardService } from '../services/dashboard.service';
import { saleService } from '../services/sale.service';
import { productService } from '../services/product.service';
import { formatCurrency, formatDate } from '../utils/format';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboard-stats',
    () => dashboardService.getStats(),
    {
      onError: (error: any) => {
        toast.error(error.message || 'Failed to load dashboard');
      },
    }
  );

  const { data: todaySales } = useQuery(
    'today-sales',
    () => saleService.getToday(),
    {
      onError: (error: any) => {
        console.error('Failed to load today sales:', error);
      },
    }
  );

  const { data: lowStockProducts } = useQuery(
    'low-stock',
    () => productService.getLowStock(),
    {
      onError: (error: any) => {
        console.error('Failed to load low stock:', error);
      },
    }
  );

  const statCards = [
    {
      title: "Today's Sales",
      value: formatCurrency(todaySales?.totalRevenue || 0),
      subtitle: `${todaySales?.count || 0} transactions`,
      icon: FiDollarSign,
      color: 'bg-green-500',
      link: '/sales',
    },
    {
      title: 'Low Stock Items',
      value: stats?.lowStock?.count || 0,
      subtitle: 'Need reordering',
      icon: FiAlertCircle,
      color: 'bg-yellow-500',
      link: '/inventory?filter=low-stock',
    },
    {
      title: 'Pending POs',
      value: stats?.pendingPurchaseOrders?.count || 0,
      subtitle: 'Purchase orders',
      icon: FiPackage,
      color: 'bg-blue-500',
      link: '/purchase-orders',
    },
    {
      title: 'Credit Outstanding',
      value: formatCurrency(stats?.customerCredit?.totalOutstanding || 0),
      subtitle: `${stats?.customerCredit?.customersWithCredit || 0} customers`,
      icon: FiUsers,
      color: 'bg-purple-500',
      link: '/customers',
    },
  ];

  return (
    <>
      <Head>
        <title>Dashboard - HARD-POS PRO</title>
      </Head>

      <Layout>
        <div className="space-y-6">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's your business overview</p>
            </div>
            <Link href="/pos" className="btn btn-primary flex items-center">
              <FiShoppingCart className="mr-2" />
              New Sale
            </Link>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Link key={index} href={stat.link}>
                  <div className="card hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                          {statsLoading ? '...' : stat.value}
                        </p>
                        <p className="text-xs text-gray-500">{stat.subtitle}</p>
                      </div>
                      <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent sales */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Sales</h2>
                <Link href="/sales" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                  View all
                  <FiArrowRight className="ml-1" />
                </Link>
              </div>
              
              {todaySales?.sales && todaySales.sales.length > 0 ? (
                <div className="space-y-3">
                  {todaySales.sales.slice(0, 5).map((sale: any) => (
                    <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {sale.receiptNumber || sale.saleNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {sale.customer?.customerName || 'Walk-in Customer'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(sale.totalAmount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(sale.saleDate).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No sales yet today</p>
                </div>
              )}
            </div>

            {/* Low stock alerts */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
                <Link href="/inventory" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                  View all
                  <FiArrowRight className="ml-1" />
                </Link>
              </div>
              
              {lowStockProducts && lowStockProducts.length > 0 ? (
                <div className="space-y-3">
                  {lowStockProducts.slice(0, 5).map((product: any) => {
                    const stockItem = product.stock?.[0];
                    const currentStock = stockItem?.availableQuantity || 0;
                    const reorderLevel = product.reorderLevel || 0;
                    
                    return (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {product.productName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.productCode}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-yellow-700">
                            {parseFloat(currentStock).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Min: {parseFloat(reorderLevel).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiPackage className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>All products well stocked</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/pos" className="p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors text-center">
                <FiShoppingCart className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-primary-600">New Sale</p>
              </Link>
              <Link href="/products/new" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center">
                <FiPackage className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-600">Add Product</p>
              </Link>
              <Link href="/customers/new" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
                <FiUsers className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-600">New Customer</p>
              </Link>
              <Link href="/reports" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center">
                <FiTrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-purple-600">View Reports</p>
              </Link>
            </div>
          </div>
        </div>
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

// Disable static generation for authenticated pages
export async function getServerSideProps() {
  return {
    props: {},
  };
}
