/**
 * Report Routes
 * Helvino Technologies Limited
 */

const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { prisma } = require('../config/database');
const ApiResponse = require('../utils/response');

const router = express.Router();

/**
 * @route   GET /api/v1/reports/dashboard
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where = {};
    if (req.user.role.roleName !== 'Super Admin') {
      where.branchId = req.user.branchId;
    }

    // Today's sales
    const todaySales = await prisma.sale.findMany({
      where: {
        ...where,
        saleDate: {
          gte: today,
          lt: tomorrow,
        },
        saleStatus: 'completed',
      },
    });

    const todayRevenue = todaySales.reduce(
      (sum, sale) => sum + parseFloat(sale.totalAmount),
      0
    );

    // Low stock products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        reorderLevel: { not: null },
      },
      include: {
        stock: {
          where: where.branchId ? { branchId: where.branchId } : {},
        },
      },
    });

    const lowStockCount = products.filter(p =>
      p.stock.some(
        s => parseFloat(s.availableQuantity) <= parseFloat(p.reorderLevel)
      )
    ).length;

    // Pending purchase orders
    const pendingPOs = await prisma.purchaseOrder.count({
      where: {
        ...where,
        poStatus: { in: ['draft', 'sent', 'partial'] },
      },
    });

    // Customer credit outstanding
    const customers = await prisma.customer.findMany({
      where: {
        isActive: true,
        currentBalance: { gt: 0 },
      },
    });

    const totalOutstanding = customers.reduce(
      (sum, c) => sum + parseFloat(c.currentBalance),
      0
    );

    const dashboard = {
      todaySales: {
        count: todaySales.length,
        revenue: todayRevenue,
      },
      lowStock: {
        count: lowStockCount,
      },
      pendingPurchaseOrders: {
        count: pendingPOs,
      },
      customerCredit: {
        customersWithCredit: customers.length,
        totalOutstanding,
      },
    };

    return ApiResponse.success(res, dashboard, 'Dashboard data retrieved successfully');
  } catch (error) {
    console.error('Dashboard error:', error);
    return ApiResponse.serverError(res, 'Failed to retrieve dashboard data', error);
  }
});

/**
 * @route   GET /api/v1/reports/sales
 * @desc    Get sales report
 * @access  Private
 */
router.get('/sales', authenticate, async (req, res) => {
  try {
    const { startDate, endDate, branchId, groupBy = 'day' } = req.query;

    const where = {
      saleStatus: 'completed',
    };

    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) where.saleDate.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.saleDate.lte = end;
      }
    }

    if (branchId) {
      where.branchId = branchId;
    } else if (req.user.role.roleName !== 'Super Admin') {
      where.branchId = req.user.branchId;
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { saleDate: 'desc' },
    });

    // Aggregate data
    const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.totalAmount), 0);
    const totalCost = sales.reduce(
      (sum, s) =>
        sum +
        s.items.reduce((itemSum, i) => itemSum + parseFloat(i.costPrice || 0) * parseFloat(i.quantity), 0),
      0
    );
    const totalProfit = totalRevenue - totalCost;

    // Group by category
    const byCategory = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const categoryName = item.product.category?.categoryName || 'Uncategorized';
        if (!byCategory[categoryName]) {
          byCategory[categoryName] = {
            revenue: 0,
            quantity: 0,
            items: 0,
          };
        }
        byCategory[categoryName].revenue += parseFloat(item.lineTotal);
        byCategory[categoryName].quantity += parseFloat(item.quantity);
        byCategory[categoryName].items++;
      });
    });

    const report = {
      summary: {
        totalSales: sales.length,
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0,
        averageSaleValue: sales.length > 0 ? (totalRevenue / sales.length).toFixed(2) : 0,
      },
      byCategory,
      sales: sales.slice(0, 100), // Limit to 100 for performance
    };

    return ApiResponse.success(res, report, 'Sales report retrieved successfully');
  } catch (error) {
    console.error('Sales report error:', error);
    return ApiResponse.serverError(res, 'Failed to retrieve sales report', error);
  }
});

/**
 * @route   GET /api/v1/reports/inventory
 * @desc    Get inventory report
 * @access  Private
 */
router.get('/inventory', authenticate, async (req, res) => {
  try {
    const { branchId, categoryId } = req.query;

    const where = {};

    if (branchId) {
      where.branchId = branchId;
    } else if (req.user.role.roleName !== 'Super Admin') {
      where.branchId = req.user.branchId;
    }

    const stock = await prisma.stock.findMany({
      where,
      include: {
        product: {
          include: {
            category: true,
            unitOfMeasure: true,
          },
        },
        branch: true,
      },
    });

    let filteredStock = stock;
    if (categoryId) {
      filteredStock = stock.filter(s => s.product.categoryId === categoryId);
    }

    const totalItems = filteredStock.length;
    const totalValue = filteredStock.reduce(
      (sum, s) =>
        sum + parseFloat(s.availableQuantity) * parseFloat(s.product.costPrice || 0),
      0
    );

    const lowStock = filteredStock.filter(
      s =>
        s.product.reorderLevel &&
        parseFloat(s.availableQuantity) <= parseFloat(s.product.reorderLevel)
    );

    const outOfStock = filteredStock.filter(s => parseFloat(s.availableQuantity) === 0);

    const report = {
      summary: {
        totalItems,
        totalValue,
        lowStockItems: lowStock.length,
        outOfStockItems: outOfStock.length,
      },
      lowStock: lowStock.map(s => ({
        product: s.product,
        currentStock: parseFloat(s.availableQuantity),
        reorderLevel: parseFloat(s.product.reorderLevel),
        branch: s.branch,
      })),
      outOfStock: outOfStock.map(s => ({
        product: s.product,
        branch: s.branch,
      })),
    };

    return ApiResponse.success(res, report, 'Inventory report retrieved successfully');
  } catch (error) {
    console.error('Inventory report error:', error);
    return ApiResponse.serverError(res, 'Failed to retrieve inventory report', error);
  }
});

module.exports = router;
