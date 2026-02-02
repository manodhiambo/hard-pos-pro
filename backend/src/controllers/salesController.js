/**
 * Sales Controller
 * Helvino Technologies Limited
 */

const { prisma } = require('../config/database');
const ApiResponse = require('../utils/response');
const validators = require('../utils/validators');
const helpers = require('../utils/helpers');

const salesController = {
  /**
   * Get all sales with pagination and filters
   */
  getAllSales: async (req, res) => {
    try {
      const {
        page = 1,
        pageSize = 20,
        startDate,
        endDate,
        customerId,
        branchId,
        saleType,
        saleStatus,
        paymentStatus,
      } = req.query;

      const { page: validPage, pageSize: validPageSize } =
        validators.validatePagination(page, pageSize);

      const offset = helpers.getPaginationOffset(validPage, validPageSize);

      // Build where clause
      const where = {};

      if (startDate || endDate) {
        where.saleDate = {};
        if (startDate) where.saleDate.gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          where.saleDate.lte = end;
        }
      }

      if (customerId) where.customerId = customerId;
      if (branchId) where.branchId = branchId;
      if (saleType) where.saleType = saleType;
      if (saleStatus) where.saleStatus = saleStatus;
      if (paymentStatus) where.paymentStatus = paymentStatus;

      // If user is not Super Admin, filter by their branch
      if (req.user.role.roleName !== 'Super Admin') {
        where.branchId = req.user.branchId;
      }

      // Get total count
      const totalItems = await prisma.sale.count({ where });

      // Get sales
      const sales = await prisma.sale.findMany({
        where,
        include: {
          customer: true,
          branch: true,
          cashier: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
        skip: offset,
        take: validPageSize,
        orderBy: { saleDate: 'desc' },
      });

      return ApiResponse.paginated(
        res,
        sales,
        { page: validPage, pageSize: validPageSize, totalItems },
        'Sales retrieved successfully'
      );

    } catch (error) {
      console.error('Get sales error:', error);
      return ApiResponse.serverError(res, 'Failed to retrieve sales', error);
    }
  },

  /**
   * Get sale by ID
   */
  getSaleById: async (req, res) => {
    try {
      const { id } = req.params;

      const sale = await prisma.sale.findUnique({
        where: { id },
        include: {
          customer: true,
          project: true,
          branch: true,
          cashier: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
          items: {
            include: {
              product: {
                include: {
                  unitOfMeasure: true,
                },
              },
              serialNumber: true,
              batch: true,
            },
          },
          payments: true,
          paymentSplits: true,
        },
      });

      if (!sale) {
        return ApiResponse.notFound(res, 'Sale not found');
      }

      return ApiResponse.success(res, sale, 'Sale retrieved successfully');

    } catch (error) {
      console.error('Get sale error:', error);
      return ApiResponse.serverError(res, 'Failed to retrieve sale', error);
    }
  },

  /**
   * Create new sale
   */
  createSale: async (req, res) => {
    try {
      const {
        customerId,
        projectId,
        saleType,
        items,
        paymentMethod,
        amountPaid,
        lpoNumber,
        deliveryRequired,
        deliveryAddress,
        notes,
      } = req.body;

      // Validate items
      if (!items || items.length === 0) {
        return ApiResponse.badRequest(res, 'Sale items are required');
      }

      // Calculate totals
      let subtotal = 0;
      let totalDiscount = 0;
      let totalTax = 0;

      const processedItems = [];

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          return ApiResponse.badRequest(res, `Product ${item.productId} not found`);
        }

        // Check stock availability
        const stock = await prisma.stock.findFirst({
          where: {
            productId: item.productId,
            branchId: req.user.branchId,
          },
        });

        if (!stock || parseFloat(stock.availableQuantity) < parseFloat(item.quantity)) {
          return ApiResponse.badRequest(
            res,
            `Insufficient stock for ${product.productName}`
          );
        }

        const unitPrice = item.unitPrice || parseFloat(product.retailPrice);
        const quantity = parseFloat(item.quantity);
        const discountPercentage = parseFloat(item.discountPercentage || 0);
        const taxRate = parseFloat(item.taxRate || product.taxRate);

        const lineSubtotal = quantity * unitPrice;
        const discountAmount = (lineSubtotal * discountPercentage) / 100;
        const taxableAmount = lineSubtotal - discountAmount;
        const taxAmount = (taxableAmount * taxRate) / 100;
        const lineTotal = taxableAmount + taxAmount;

        subtotal += lineSubtotal;
        totalDiscount += discountAmount;
        totalTax += taxAmount;

        processedItems.push({
          productId: item.productId,
          description: item.description || product.productName,
          quantity,
          unitPrice,
          costPrice: parseFloat(product.costPrice || 0),
          discountPercentage,
          discountAmount,
          taxRate,
          taxAmount,
          lineTotal,
          serialNumberId: item.serialNumberId || null,
          batchId: item.batchId || null,
          dimensionalStockId: item.dimensionalStockId || null,
          cutLength: item.cutLength || null,
          cutWeight: item.cutWeight || null,
          locationId: stock.locationId,
        });
      }

      const totalAmount = subtotal - totalDiscount + totalTax;

      // Generate sale number and receipt number
      const saleNumber = validators.generateCode('SAL-', 8);
      const receiptNumber = validators.generateReceiptNumber();

      // Create sale in transaction
      const sale = await prisma.$transaction(async (tx) => {
        // Create sale
        const newSale = await tx.sale.create({
          data: {
            saleNumber,
            receiptNumber,
            branchId: req.user.branchId,
            customerId: customerId || null,
            projectId: projectId || null,
            saleType: saleType || 'retail',
            subtotal,
            discountAmount: totalDiscount,
            taxAmount: totalTax,
            totalAmount,
            paymentMethod: paymentMethod || null,
            amountPaid: amountPaid ? parseFloat(amountPaid) : 0,
            paymentStatus: amountPaid && parseFloat(amountPaid) >= totalAmount 
              ? 'paid' 
              : parseFloat(amountPaid) > 0 
              ? 'partial' 
              : 'pending',
            lpoNumber: lpoNumber || null,
            deliveryRequired: deliveryRequired || false,
            deliveryAddress: deliveryAddress || null,
            notes: notes || null,
            cashierId: req.user.id,
          },
        });

        // Create sale items
        await tx.saleItem.createMany({
          data: processedItems.map(item => ({
            ...item,
            saleId: newSale.id,
          })),
        });

        // Update stock
        for (const item of processedItems) {
          await tx.stock.update({
            where: {
              productId_branchId_locationId: {
                productId: item.productId,
                branchId: req.user.branchId,
                locationId: item.locationId,
              },
            },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });

          // Create stock movement
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              branchId: req.user.branchId,
              locationId: item.locationId,
              movementType: 'sale',
              referenceType: 'sale',
              referenceId: newSale.id,
              quantity: -item.quantity,
              unitCost: item.costPrice,
              createdBy: req.user.id,
            },
          });

          // Update serial number if applicable
          if (item.serialNumberId) {
            await tx.serialNumber.update({
              where: { id: item.serialNumberId },
              data: {
                stockStatus: 'sold',
                saleId: newSale.id,
                soldDate: new Date(),
                customerId: customerId || null,
              },
            });
          }
        }

        // Create payment record if paid
        if (amountPaid && parseFloat(amountPaid) > 0) {
          const paymentNumber = validators.generateCode('PAY-', 8);
          
          await tx.payment.create({
            data: {
              paymentNumber,
              paymentType: 'sale_payment',
              referenceType: 'sale',
              referenceId: newSale.id,
              customerId: customerId || null,
              saleId: newSale.id,
              paymentMethod: paymentMethod || 'cash',
              amount: parseFloat(amountPaid),
              status: 'completed',
              receivedBy: req.user.id,
            },
          });
        }

        return newSale;
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'SALE_CREATE',
          description: `Created sale ${saleNumber}`,
          metadata: { saleId: sale.id, totalAmount },
          ipAddress: req.ip,
        },
      });

      // Fetch complete sale data
      const completeSale = await prisma.sale.findUnique({
        where: { id: sale.id },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
          payments: true,
        },
      });

      return ApiResponse.created(res, completeSale, 'Sale created successfully');

    } catch (error) {
      console.error('Create sale error:', error);
      return ApiResponse.serverError(res, 'Failed to create sale', error);
    }
  },

  /**
   * Get sales summary/statistics
   */
  getSalesSummary: async (req, res) => {
    try {
      const { startDate, endDate, branchId } = req.query;

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

      // Get aggregated data
      const sales = await prisma.sale.findMany({
        where,
        select: {
          totalAmount: true,
          saleType: true,
          paymentMethod: true,
          paymentStatus: true,
        },
      });

      const summary = {
        totalSales: sales.length,
        totalRevenue: sales.reduce((sum, s) => sum + parseFloat(s.totalAmount), 0),
        averageSaleValue: sales.length > 0 
          ? sales.reduce((sum, s) => sum + parseFloat(s.totalAmount), 0) / sales.length 
          : 0,
        salesByType: {
          retail: sales.filter(s => s.saleType === 'retail').length,
          trade: sales.filter(s => s.saleType === 'trade').length,
          wholesale: sales.filter(s => s.saleType === 'wholesale').length,
        },
        salesByPaymentMethod: {
          cash: sales.filter(s => s.paymentMethod === 'cash').length,
          mpesa: sales.filter(s => s.paymentMethod === 'mpesa').length,
          card: sales.filter(s => s.paymentMethod === 'card').length,
          credit: sales.filter(s => s.paymentMethod === 'credit').length,
        },
        paymentStatus: {
          paid: sales.filter(s => s.paymentStatus === 'paid').length,
          partial: sales.filter(s => s.paymentStatus === 'partial').length,
          pending: sales.filter(s => s.paymentStatus === 'pending').length,
        },
      };

      return ApiResponse.success(res, summary, 'Sales summary retrieved successfully');

    } catch (error) {
      console.error('Get sales summary error:', error);
      return ApiResponse.serverError(res, 'Failed to retrieve sales summary', error);
    }
  },

  /**
   * Get today's sales
   */
  getTodaySales: async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const where = {
        saleDate: {
          gte: today,
          lt: tomorrow,
        },
      };

      if (req.user.role.roleName !== 'Super Admin') {
        where.branchId = req.user.branchId;
      }

      const sales = await prisma.sale.findMany({
        where,
        include: {
          customer: true,
          cashier: {
            select: {
              fullName: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { saleDate: 'desc' },
      });

      const totalRevenue = sales.reduce((sum, s) => 
        sum + parseFloat(s.totalAmount), 0
      );

      return ApiResponse.success(res, {
        sales,
        count: sales.length,
        totalRevenue,
      }, "Today's sales retrieved successfully");

    } catch (error) {
      console.error('Get today sales error:', error);
      return ApiResponse.serverError(res, "Failed to retrieve today's sales", error);
    }
  },

  /**
   * Cancel sale
   */
  cancelSale: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const sale = await prisma.sale.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (!sale) {
        return ApiResponse.notFound(res, 'Sale not found');
      }

      if (sale.saleStatus === 'cancelled') {
        return ApiResponse.badRequest(res, 'Sale is already cancelled');
      }

      // Cancel sale and restore stock
      await prisma.$transaction(async (tx) => {
        // Update sale status
        await tx.sale.update({
          where: { id },
          data: {
            saleStatus: 'cancelled',
            notes: `Cancelled: ${reason || 'No reason provided'}`,
          },
        });

        // Restore stock for each item
        for (const item of sale.items) {
          await tx.stock.update({
            where: {
              productId_branchId_locationId: {
                productId: item.productId,
                branchId: sale.branchId,
                locationId: item.locationId,
              },
            },
            data: {
              quantity: {
                increment: parseFloat(item.quantity),
              },
            },
          });

          // Create stock movement
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              branchId: sale.branchId,
              locationId: item.locationId,
              movementType: 'sale_cancel',
              referenceType: 'sale',
              referenceId: id,
              quantity: parseFloat(item.quantity),
              reason: `Sale cancelled: ${reason || 'No reason'}`,
              createdBy: req.user.id,
            },
          });

          // Update serial number if applicable
          if (item.serialNumberId) {
            await tx.serialNumber.update({
              where: { id: item.serialNumberId },
              data: {
                stockStatus: 'in_stock',
                saleId: null,
                soldDate: null,
                customerId: null,
              },
            });
          }
        }
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'SALE_CANCEL',
          description: `Cancelled sale ${sale.saleNumber}`,
          metadata: { saleId: id, reason },
          ipAddress: req.ip,
        },
      });

      return ApiResponse.success(res, null, 'Sale cancelled successfully');

    } catch (error) {
      console.error('Cancel sale error:', error);
      return ApiResponse.serverError(res, 'Failed to cancel sale', error);
    }
  },
};

module.exports = salesController;
