/**
 * Purchase Order Controller
 * Helvino Technologies Limited
 */

const { prisma } = require('../config/database');
const ApiResponse = require('../utils/response');
const validators = require('../utils/validators');
const helpers = require('../utils/helpers');

const purchaseOrderController = {
  /**
   * Get all purchase orders
   */
  getAllPurchaseOrders: async (req, res) => {
    try {
      const {
        page = 1,
        pageSize = 20,
        supplierId,
        branchId,
        poStatus,
        startDate,
        endDate,
      } = req.query;

      const { page: validPage, pageSize: validPageSize } =
        validators.validatePagination(page, pageSize);

      const offset = helpers.getPaginationOffset(validPage, validPageSize);

      const where = {};

      if (supplierId) where.supplierId = supplierId;
      
      if (branchId) {
        where.branchId = branchId;
      } else if (req.user.role.roleName !== 'Super Admin') {
        where.branchId = req.user.branchId;
      }

      if (poStatus) where.poStatus = poStatus;

      if (startDate || endDate) {
        where.orderDate = {};
        if (startDate) where.orderDate.gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setDate(end.getDate() + 1);
          where.orderDate.lt = end;
        }
      }

      const totalItems = await prisma.purchaseOrder.count({ where });

      const purchaseOrders = await prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: true,
          branch: true,
          creator: {
            select: {
              id: true,
              fullName: true,
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
        orderBy: { orderDate: 'desc' },
      });

      return ApiResponse.paginated(
        res,
        purchaseOrders,
        { page: validPage, pageSize: validPageSize, totalItems },
        'Purchase orders retrieved successfully'
      );

    } catch (error) {
      console.error('Get purchase orders error:', error);
      return ApiResponse.serverError(res, 'Failed to retrieve purchase orders', error);
    }
  },

  /**
   * Get purchase order by ID
   */
  getPurchaseOrderById: async (req, res) => {
    try {
      const { id } = req.params;

      const purchaseOrder = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: {
          supplier: true,
          branch: true,
          creator: {
            select: {
              id: true,
              fullName: true,
            },
          },
          approver: {
            select: {
              id: true,
              fullName: true,
            },
          },
          items: {
            include: {
              product: {
                include: {
                  unitOfMeasure: true,
                },
              },
            },
          },
          goodsReceipts: true,
        },
      });

      if (!purchaseOrder) {
        return ApiResponse.notFound(res, 'Purchase order not found');
      }

      return ApiResponse.success(
        res,
        purchaseOrder,
        'Purchase order retrieved successfully'
      );

    } catch (error) {
      console.error('Get purchase order error:', error);
      return ApiResponse.serverError(res, 'Failed to retrieve purchase order', error);
    }
  },

  /**
   * Create purchase order
   */
  createPurchaseOrder: async (req, res) => {
    try {
      const {
        supplierId,
        orderDate,
        expectedDeliveryDate,
        items,
        shippingCost,
        otherCharges,
        notes,
        termsAndConditions,
      } = req.body;

      if (!items || items.length === 0) {
        return ApiResponse.badRequest(res, 'Purchase order items are required');
      }

      // Calculate totals
      let subtotal = 0;
      let totalTax = 0;

      const processedItems = [];

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          return ApiResponse.badRequest(res, `Product ${item.productId} not found`);
        }

        const quantity = parseFloat(item.quantityOrdered);
        const unitPrice = parseFloat(item.unitPrice);
        const taxRate = parseFloat(item.taxRate || 16);
        const discountPercentage = parseFloat(item.discountPercentage || 0);

        const lineSubtotal = quantity * unitPrice;
        const discount = (lineSubtotal * discountPercentage) / 100;
        const taxableAmount = lineSubtotal - discount;
        const tax = (taxableAmount * taxRate) / 100;
        const lineTotal = taxableAmount + tax;

        subtotal += lineSubtotal;
        totalTax += tax;

        processedItems.push({
          productId: item.productId,
          description: item.description || product.productName,
          quantityOrdered: quantity,
          unitPrice,
          taxRate,
          discountPercentage,
          lineTotal,
          expectedDeliveryDate: item.expectedDeliveryDate 
            ? new Date(item.expectedDeliveryDate) 
            : null,
          specialOrderCustomerId: item.specialOrderCustomerId || null,
        });
      }

      const shipping = parseFloat(shippingCost || 0);
      const other = parseFloat(otherCharges || 0);
      const totalAmount = subtotal + totalTax + shipping + other;

      const poNumber = validators.generateCode('PO-', 8);

      const purchaseOrder = await prisma.$transaction(async (tx) => {
        const newPO = await tx.purchaseOrder.create({
          data: {
            poNumber,
            supplierId,
            branchId: req.user.branchId,
            orderDate: new Date(orderDate),
            expectedDeliveryDate: expectedDeliveryDate 
              ? new Date(expectedDeliveryDate) 
              : null,
            poStatus: 'draft',
            subtotal,
            taxAmount: totalTax,
            shippingCost: shipping,
            otherCharges: other,
            totalAmount,
            notes: notes || null,
            termsAndConditions: termsAndConditions || null,
            createdBy: req.user.id,
          },
        });

        await tx.purchaseOrderItem.createMany({
          data: processedItems.map(item => ({
            ...item,
            poId: newPO.id,
          })),
        });

        return newPO;
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'PURCHASE_ORDER_CREATE',
          description: `Created purchase order ${poNumber}`,
          metadata: { purchaseOrderId: purchaseOrder.id },
          ipAddress: req.ip,
        },
      });

      const completePO = await prisma.purchaseOrder.findUnique({
        where: { id: purchaseOrder.id },
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      return ApiResponse.created(
        res,
        completePO,
        'Purchase order created successfully'
      );

    } catch (error) {
      console.error('Create purchase order error:', error);
      return ApiResponse.serverError(res, 'Failed to create purchase order', error);
    }
  },

  /**
   * Approve purchase order
   */
  approvePurchaseOrder: async (req, res) => {
    try {
      const { id } = req.params;

      const purchaseOrder = await prisma.purchaseOrder.findUnique({
        where: { id },
      });

      if (!purchaseOrder) {
        return ApiResponse.notFound(res, 'Purchase order not found');
      }

      if (purchaseOrder.poStatus !== 'draft') {
        return ApiResponse.badRequest(res, 'Purchase order is not in draft status');
      }

      await prisma.purchaseOrder.update({
        where: { id },
        data: {
          poStatus: 'sent',
          approvedBy: req.user.id,
          approvedAt: new Date(),
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'PURCHASE_ORDER_APPROVE',
          description: `Approved purchase order ${purchaseOrder.poNumber}`,
          metadata: { purchaseOrderId: id },
          ipAddress: req.ip,
        },
      });

      return ApiResponse.success(res, null, 'Purchase order approved successfully');

    } catch (error) {
      console.error('Approve purchase order error:', error);
      return ApiResponse.serverError(res, 'Failed to approve purchase order', error);
    }
  },

  /**
   * Create goods receipt
   */
  createGoodsReceipt: async (req, res) => {
    try {
      const {
        poId,
        supplierId,
        receiptDate,
        supplierInvoiceNo,
        supplierDeliveryNote,
        items,
      } = req.body;

      if (!items || items.length === 0) {
        return ApiResponse.badRequest(res, 'Receipt items are required');
      }

      const grnNumber = validators.generateCode('GRN-', 8);

      const goodsReceipt = await prisma.$transaction(async (tx) => {
        const newGRN = await tx.goodsReceipt.create({
          data: {
            grnNumber,
            poId: poId || null,
            supplierId,
            branchId: req.user.branchId,
            receiptDate: new Date(receiptDate),
            supplierInvoiceNo: supplierInvoiceNo || null,
            supplierDeliveryNote: supplierDeliveryNote || null,
            status: 'pending',
            receivedBy: req.user.id,
          },
        });

        for (const item of items) {
          const quantityReceived = parseFloat(item.quantityReceived);
          const quantityAccepted = parseFloat(item.quantityAccepted || quantityReceived);

          await tx.goodsReceiptItem.create({
            data: {
              grnId: newGRN.id,
              poItemId: item.poItemId || null,
              productId: item.productId,
              quantityReceived,
              quantityAccepted,
              quantityRejected: quantityReceived - quantityAccepted,
              actualLength: item.actualLength ? parseFloat(item.actualLength) : null,
              actualWeight: item.actualWeight ? parseFloat(item.actualWeight) : null,
              batchNumber: item.batchNumber || null,
              expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
              locationId: item.locationId,
              qualityStatus: item.qualityStatus || 'approved',
              rejectionReason: item.rejectionReason || null,
            },
          });

          // Update stock if approved
          if (quantityAccepted > 0) {
            const existingStock = await tx.stock.findFirst({
              where: {
                productId: item.productId,
                branchId: req.user.branchId,
                locationId: item.locationId,
              },
            });

            if (existingStock) {
              await tx.stock.update({
                where: { id: existingStock.id },
                data: {
                  quantity: {
                    increment: quantityAccepted,
                  },
                },
              });
            } else {
              await tx.stock.create({
                data: {
                  productId: item.productId,
                  branchId: req.user.branchId,
                  locationId: item.locationId,
                  quantity: quantityAccepted,
                  reservedQuantity: 0,
                },
              });
            }

            // Create stock movement
            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                branchId: req.user.branchId,
                locationId: item.locationId,
                movementType: 'purchase',
                referenceType: 'goods_receipt',
                referenceId: newGRN.id,
                quantity: quantityAccepted,
                createdBy: req.user.id,
              },
            });
          }

          // Update PO item if linked
          if (item.poItemId) {
            await tx.purchaseOrderItem.update({
              where: { id: item.poItemId },
              data: {
                quantityReceived: {
                  increment: quantityReceived,
                },
              },
            });
          }
        }

        // Update PO status if all items received
        if (poId) {
          const poItems = await tx.purchaseOrderItem.findMany({
            where: { poId },
          });

          const allReceived = poItems.every(item => 
            parseFloat(item.quantityReceived) >= parseFloat(item.quantityOrdered)
          );

          if (allReceived) {
            await tx.purchaseOrder.update({
              where: { id: poId },
              data: {
                poStatus: 'received',
                actualDeliveryDate: new Date(receiptDate),
              },
            });
          } else {
            await tx.purchaseOrder.update({
              where: { id: poId },
              data: {
                poStatus: 'partial',
              },
            });
          }
        }

        return newGRN;
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'GOODS_RECEIPT_CREATE',
          description: `Created goods receipt ${grnNumber}`,
          metadata: { goodsReceiptId: goodsReceipt.id },
          ipAddress: req.ip,
        },
      });

      const completeGRN = await prisma.goodsReceipt.findUnique({
        where: { id: goodsReceipt.id },
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      return ApiResponse.created(
        res,
        completeGRN,
        'Goods receipt created successfully'
      );

    } catch (error) {
      console.error('Create goods receipt error:', error);
      return ApiResponse.serverError(res, 'Failed to create goods receipt', error);
    }
  },
};

module.exports = purchaseOrderController;
