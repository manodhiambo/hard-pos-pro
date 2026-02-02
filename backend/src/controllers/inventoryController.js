/**
 * Inventory Controller
 * Helvino Technologies Limited
 */

const { prisma } = require('../config/database');
const ApiResponse = require('../utils/response');
const validators = require('../utils/validators');
const helpers = require('../utils/helpers');

const inventoryController = {
  /**
   * Get stock by branch
   */
  getStock: async (req, res) => {
    try {
      const {
        page = 1,
        pageSize = 20,
        branchId,
        productId,
        belowReorderLevel,
      } = req.query;

      const { page: validPage, pageSize: validPageSize } =
        validators.validatePagination(page, pageSize);

      const offset = helpers.getPaginationOffset(validPage, validPageSize);

      const where = {};

      if (branchId) {
        where.branchId = branchId;
      } else if (req.user.role.roleName !== 'Super Admin') {
        where.branchId = req.user.branchId;
      }

      if (productId) {
        where.productId = productId;
      }

      // Get stock
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
          location: true,
        },
        skip: offset,
        take: validPageSize,
        orderBy: { updatedAt: 'desc' },
      });

      // Filter by reorder level if requested
      let filteredStock = stock;
      if (belowReorderLevel === 'true') {
        filteredStock = stock.filter(s => 
          s.product.reorderLevel && 
          parseFloat(s.availableQuantity) <= parseFloat(s.product.reorderLevel)
        );
      }

      const totalItems = await prisma.stock.count({ where });

      return ApiResponse.paginated(
        res,
        filteredStock,
        { page: validPage, pageSize: validPageSize, totalItems },
        'Stock retrieved successfully'
      );

    } catch (error) {
      console.error('Get stock error:', error);
      return ApiResponse.serverError(res, 'Failed to retrieve stock', error);
    }
  },

  /**
   * Get stock movements
   */
  getStockMovements: async (req, res) => {
    try {
      const {
        page = 1,
        pageSize = 20,
        productId,
        branchId,
        movementType,
        startDate,
        endDate,
      } = req.query;

      const { page: validPage, pageSize: validPageSize } =
        validators.validatePagination(page, pageSize);

      const offset = helpers.getPaginationOffset(validPage, validPageSize);

      const where = {};

      if (productId) where.productId = productId;
      
      if (branchId) {
        where.branchId = branchId;
      } else if (req.user.role.roleName !== 'Super Admin') {
        where.branchId = req.user.branchId;
      }

      if (movementType) where.movementType = movementType;

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          where.createdAt.lte = end;
        }
      }

      const totalItems = await prisma.stockMovement.count({ where });

      const movements = await prisma.stockMovement.findMany({
        where,
        include: {
          product: true,
          branch: true,
          location: true,
          fromLocation: true,
          toLocation: true,
          creator: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
        },
        skip: offset,
        take: validPageSize,
        orderBy: { createdAt: 'desc' },
      });

      return ApiResponse.paginated(
        res,
        movements,
        { page: validPage, pageSize: validPageSize, totalItems },
        'Stock movements retrieved successfully'
      );

    } catch (error) {
      console.error('Get stock movements error:', error);
      return ApiResponse.serverError(res, 'Failed to retrieve stock movements', error);
    }
  },

  /**
   * Create stock adjustment
   */
  createStockAdjustment: async (req, res) => {
    try {
      const {
        adjustmentDate,
        adjustmentType,
        reason,
        notes,
        items,
      } = req.body;

      if (!items || items.length === 0) {
        return ApiResponse.badRequest(res, 'Adjustment items are required');
      }

      const adjustmentNumber = validators.generateCode('ADJ-', 8);

      const adjustment = await prisma.$transaction(async (tx) => {
        // Create adjustment
        const newAdjustment = await tx.stockAdjustment.create({
          data: {
            adjustmentNumber,
            branchId: req.user.branchId,
            adjustmentDate: new Date(adjustmentDate),
            adjustmentType: adjustmentType || 'count_correction',
            reason: reason || null,
            notes: notes || null,
            status: 'pending',
            createdBy: req.user.id,
          },
        });

        // Create adjustment items
        for (const item of items) {
          await tx.stockAdjustmentItem.create({
            data: {
              adjustmentId: newAdjustment.id,
              productId: item.productId,
              locationId: item.locationId,
              currentQuantity: parseFloat(item.currentQuantity),
              countedQuantity: parseFloat(item.countedQuantity),
              adjustmentQuantity: parseFloat(item.countedQuantity) - parseFloat(item.currentQuantity),
              unitCost: item.unitCost ? parseFloat(item.unitCost) : null,
              reason: item.reason || null,
            },
          });
        }

        return newAdjustment;
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'STOCK_ADJUSTMENT_CREATE',
          description: `Created stock adjustment ${adjustmentNumber}`,
          metadata: { adjustmentId: adjustment.id },
          ipAddress: req.ip,
        },
      });

      const completeAdjustment = await prisma.stockAdjustment.findUnique({
        where: { id: adjustment.id },
        include: {
          items: {
            include: {
              product: true,
              location: true,
            },
          },
        },
      });

      return ApiResponse.created(
        res,
        completeAdjustment,
        'Stock adjustment created successfully'
      );

    } catch (error) {
      console.error('Create stock adjustment error:', error);
      return ApiResponse.serverError(res, 'Failed to create stock adjustment', error);
    }
  },

  /**
   * Approve stock adjustment
   */
  approveStockAdjustment: async (req, res) => {
    try {
      const { id } = req.params;

      const adjustment = await prisma.stockAdjustment.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (!adjustment) {
        return ApiResponse.notFound(res, 'Stock adjustment not found');
      }

      if (adjustment.status !== 'pending') {
        return ApiResponse.badRequest(res, 'Adjustment is not pending');
      }

      // Approve and update stock
      await prisma.$transaction(async (tx) => {
        // Update adjustment status
        await tx.stockAdjustment.update({
          where: { id },
          data: {
            status: 'approved',
            approvedBy: req.user.id,
            approvedAt: new Date(),
          },
        });

        // Update stock for each item
        for (const item of adjustment.items) {
          const adjustmentQty = parseFloat(item.adjustmentQuantity);

          await tx.stock.update({
            where: {
              productId_branchId_locationId: {
                productId: item.productId,
                branchId: adjustment.branchId,
                locationId: item.locationId,
              },
            },
            data: {
              quantity: {
                increment: adjustmentQty,
              },
            },
          });

          // Create stock movement
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              branchId: adjustment.branchId,
              locationId: item.locationId,
              movementType: adjustmentQty > 0 ? 'adjustment' : 'adjustment',
              referenceType: 'adjustment',
              referenceId: id,
              quantity: adjustmentQty,
              unitCost: item.unitCost,
              reason: item.reason,
              createdBy: req.user.id,
            },
          });
        }
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'STOCK_ADJUSTMENT_APPROVE',
          description: `Approved stock adjustment ${adjustment.adjustmentNumber}`,
          metadata: { adjustmentId: id },
          ipAddress: req.ip,
        },
      });

      return ApiResponse.success(res, null, 'Stock adjustment approved successfully');

    } catch (error) {
      console.error('Approve stock adjustment error:', error);
      return ApiResponse.serverError(res, 'Failed to approve stock adjustment', error);
    }
  },

  /**
   * Get stock valuation
   */
  getStockValuation: async (req, res) => {
    try {
      const { branchId } = req.query;

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
            select: {
              id: true,
              productCode: true,
              productName: true,
              costPrice: true,
              retailPrice: true,
              category: true,
            },
          },
          branch: true,
        },
      });

      let totalCostValue = 0;
      let totalRetailValue = 0;

      const valuationByCategory = {};

      stock.forEach(s => {
        const qty = parseFloat(s.availableQuantity);
        const costPrice = parseFloat(s.product.costPrice || 0);
        const retailPrice = parseFloat(s.product.retailPrice || 0);

        const costValue = qty * costPrice;
        const retailValue = qty * retailPrice;

        totalCostValue += costValue;
        totalRetailValue += retailValue;

        const categoryName = s.product.category?.categoryName || 'Uncategorized';

        if (!valuationByCategory[categoryName]) {
          valuationByCategory[categoryName] = {
            costValue: 0,
            retailValue: 0,
            items: 0,
          };
        }

        valuationByCategory[categoryName].costValue += costValue;
        valuationByCategory[categoryName].retailValue += retailValue;
        valuationByCategory[categoryName].items++;
      });

      const valuation = {
        totalCostValue,
        totalRetailValue,
        potentialProfit: totalRetailValue - totalCostValue,
        profitMargin: totalCostValue > 0 
          ? ((totalRetailValue - totalCostValue) / totalCostValue * 100).toFixed(2)
          : 0,
        totalItems: stock.length,
        valuationByCategory,
      };

      return ApiResponse.success(
        res,
        valuation,
        'Stock valuation retrieved successfully'
      );

    } catch (error) {
      console.error('Get stock valuation error:', error);
      return ApiResponse.serverError(res, 'Failed to retrieve stock valuation', error);
    }
  },

  /**
   * Create stock transfer
   */
  createStockTransfer: async (req, res) => {
    try {
      const {
        toBranchId,
        transferDate,
        expectedArrivalDate,
        vehicleNumber,
        driverName,
        driverPhone,
        notes,
        items,
      } = req.body;

      if (!items || items.length === 0) {
        return ApiResponse.badRequest(res, 'Transfer items are required');
      }

      const transferNumber = validators.generateCode('TRF-', 8);

      const transfer = await prisma.$transaction(async (tx) => {
        // Create transfer
        const newTransfer = await tx.stockTransfer.create({
          data: {
            transferNumber,
            fromBranchId: req.user.branchId,
            toBranchId,
            transferDate: new Date(transferDate),
            expectedArrivalDate: expectedArrivalDate ? new Date(expectedArrivalDate) : null,
            status: 'pending',
            vehicleNumber: vehicleNumber || null,
            driverName: driverName || null,
            driverPhone: driverPhone || null,
            notes: notes || null,
            sentBy: req.user.id,
          },
        });

        // Create transfer items and reserve stock
        for (const item of items) {
          // Check stock availability
          const stock = await tx.stock.findFirst({
            where: {
              productId: item.productId,
              branchId: req.user.branchId,
              locationId: item.fromLocationId,
            },
          });

          if (!stock || parseFloat(stock.availableQuantity) < parseFloat(item.quantitySent)) {
            throw new Error(`Insufficient stock for product ${item.productId}`);
          }

          await tx.stockTransferItem.create({
            data: {
              transferId: newTransfer.id,
              productId: item.productId,
              quantitySent: parseFloat(item.quantitySent),
              fromLocationId: item.fromLocationId,
              toLocationId: item.toLocationId || null,
              serialNumberId: item.serialNumberId || null,
              dimensionalStockId: item.dimensionalStockId || null,
              condition: 'good',
            },
          });

          // Reserve stock at source
          await tx.stock.update({
            where: {
              productId_branchId_locationId: {
                productId: item.productId,
                branchId: req.user.branchId,
                locationId: item.fromLocationId,
              },
            },
            data: {
              reservedQuantity: {
                increment: parseFloat(item.quantitySent),
              },
            },
          });
        }

        return newTransfer;
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'STOCK_TRANSFER_CREATE',
          description: `Created stock transfer ${transferNumber}`,
          metadata: { transferId: transfer.id },
          ipAddress: req.ip,
        },
      });

      const completeTransfer = await prisma.stockTransfer.findUnique({
        where: { id: transfer.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          fromBranch: true,
          toBranch: true,
        },
      });

      return ApiResponse.created(
        res,
        completeTransfer,
        'Stock transfer created successfully'
      );

    } catch (error) {
      console.error('Create stock transfer error:', error);
      return ApiResponse.serverError(res, 'Failed to create stock transfer', error);
    }
  },

  /**
   * Receive stock transfer
   */
  receiveStockTransfer: async (req, res) => {
    try {
      const { id } = req.params;
      const { items } = req.body;

      const transfer = await prisma.stockTransfer.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (!transfer) {
        return ApiResponse.notFound(res, 'Stock transfer not found');
      }

      if (transfer.status !== 'pending' && transfer.status !== 'in_transit') {
        return ApiResponse.badRequest(res, 'Transfer is not pending or in transit');
      }

      await prisma.$transaction(async (tx) => {
        // Update transfer status
        await tx.stockTransfer.update({
          where: { id },
          data: {
            status: 'received',
            actualArrivalDate: new Date(),
            receivedBy: req.user.id,
          },
        });

        // Process each item
        for (const receivedItem of items) {
          const transferItem = transfer.items.find(ti => ti.id === receivedItem.itemId);
          
          if (!transferItem) continue;

          const quantityReceived = parseFloat(receivedItem.quantityReceived);

          // Update transfer item
          await tx.stockTransferItem.update({
            where: { id: transferItem.id },
            data: {
              quantityReceived,
              condition: receivedItem.condition || 'good',
              notes: receivedItem.notes || null,
            },
          });

          // Remove reservation from source
          await tx.stock.update({
            where: {
              productId_branchId_locationId: {
                productId: transferItem.productId,
                branchId: transfer.fromBranchId,
                locationId: transferItem.fromLocationId,
              },
            },
            data: {
              reservedQuantity: {
                decrement: parseFloat(transferItem.quantitySent),
              },
              quantity: {
                decrement: parseFloat(transferItem.quantitySent),
              },
            },
          });

          // Add to destination (check if stock record exists first)
          const destinationStock = await tx.stock.findFirst({
            where: {
              productId: transferItem.productId,
              branchId: transfer.toBranchId,
              locationId: transferItem.toLocationId,
            },
          });

          if (destinationStock) {
            await tx.stock.update({
              where: { id: destinationStock.id },
              data: {
                quantity: {
                  increment: quantityReceived,
                },
              },
            });
          } else {
            await tx.stock.create({
              data: {
                productId: transferItem.productId,
                branchId: transfer.toBranchId,
                locationId: transferItem.toLocationId,
                quantity: quantityReceived,
                reservedQuantity: 0,
              },
            });
          }

          // Create stock movements
          await tx.stockMovement.create({
            data: {
              productId: transferItem.productId,
              branchId: transfer.fromBranchId,
              locationId: transferItem.fromLocationId,
              movementType: 'transfer_out',
              referenceType: 'transfer',
              referenceId: id,
              quantity: -parseFloat(transferItem.quantitySent),
              createdBy: req.user.id,
            },
          });

          await tx.stockMovement.create({
            data: {
              productId: transferItem.productId,
              branchId: transfer.toBranchId,
              locationId: transferItem.toLocationId,
              movementType: 'transfer_in',
              referenceType: 'transfer',
              referenceId: id,
              quantity: quantityReceived,
              createdBy: req.user.id,
            },
          });
        }
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'STOCK_TRANSFER_RECEIVE',
          description: `Received stock transfer ${transfer.transferNumber}`,
          metadata: { transferId: id },
          ipAddress: req.ip,
        },
      });

      return ApiResponse.success(res, null, 'Stock transfer received successfully');

    } catch (error) {
      console.error('Receive stock transfer error:', error);
      return ApiResponse.serverError(res, 'Failed to receive stock transfer', error);
    }
  },
};

module.exports = inventoryController;
