import { useState } from 'react';
import { useQuery } from 'react-query';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiPackage,
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiFilter,
  FiDownload,
} from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import { productService } from '../../services/product.service';
import { formatCurrency } from '../../utils/format';
import toast from 'react-hot-toast';

export default function Products() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data, isLoading, refetch } = useQuery(
    ['products', page, search, categoryFilter],
    () =>
      productService.getAll({
        page,
        pageSize: 20,
        search: search || undefined,
        categoryId: categoryFilter || undefined,
      }),
    {
      keepPreviousData: true,
      onError: (error: any) => {
        toast.error('Failed to load products');
      },
    }
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await productService.delete(id);
      toast.success('Product deleted successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  return (
    <>
      <Head>
        <title>Products - HARD-POS PRO</title>
      </Head>

      <Layout>
        <div className="space-y-6">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 mt-1">
                Manage your product catalog
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="btn btn-secondary flex items-center">
                <FiDownload className="mr-2" />
                Export
              </button>
              <Link href="/products/new" className="btn btn-primary flex items-center">
                <FiPlus className="mr-2" />
                Add Product
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="card">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-10 w-full"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              <button className="btn btn-secondary flex items-center">
                <FiFilter className="mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Products table */}
          <div className="card overflow-hidden">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-600">Loading products...</p>
              </div>
            ) : data && data.data.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead className="table-header">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code/Barcode
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.data.map((product) => {
                        const totalStock = product.stock?.reduce(
                          (sum, s) => sum + parseFloat(s.availableQuantity),
                          0
                        ) || 0;
                        const isLowStock = product.reorderLevel && totalStock <= product.reorderLevel;

                        return (
                          <tr key={product.id} className="table-row">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                  <FiPackage className="w-5 h-5 text-gray-500" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {product.productName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {product.productType}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{product.productCode}</div>
                              {product.barcode && (
                                <div className="text-sm text-gray-500">{product.barcode}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {product.category?.categoryName || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(product.retailPrice)}
                              </div>
                              {product.tradePrice && (
                                <div className="text-xs text-gray-500">
                                  Trade: {formatCurrency(product.tradePrice)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                                {totalStock.toFixed(2)}
                              </div>
                              {isLowStock && (
                                <div className="text-xs text-red-500">Low stock</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  product.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {product.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => router.push(`/products/${product.id}`)}
                                className="text-primary-600 hover:text-primary-900 mr-3"
                              >
                                <FiEdit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id, product.productName)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {data.pagination.totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing page {data.pagination.page} of {data.pagination.totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={!data.pagination.hasPrev}
                        className="btn btn-secondary disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={!data.pagination.hasNext}
                        className="btn btn-secondary disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <FiPackage className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">No products found</p>
                <Link href="/products/new" className="btn btn-primary">
                  Add Your First Product
                </Link>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}
