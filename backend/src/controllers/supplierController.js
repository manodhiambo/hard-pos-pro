/**
 * Supplier Controller
 * Helvino Technologies Limited
 */

const { prisma } = require('../config/database');
const ApiResponse = require('../utils/response');
const validators = require('../utils/validators');
const helpers = require('../utils/helpers');

const supplierController = {
  /**
   * Get all suppliers
   */
  getAllSuppliers: async (req, res) => {
    try {
      const {
        page = 1,
        pageSize = 20,
        search,
        supplierType,
        isActive,
      } = req.query;

      const { page: validPage, pageSize: validPageSize } =
        validators.validatePagination(page, pageSize);

      const offset = helpers.getPaginationOffset(validPage, validPageSize);

      const where = {};

      if (search) {
        where.OR = [
          { supplierName: { contains: search, mode: 'insensitive' } },
          { supplierCode: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (supplierType) where.supplierType = supplierType;
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const totalItems = await prisma.supplier.count({ where });

      const suppliers = await prisma.supplier.findMany({
        where,
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
        skip: offset,
        take: validPageSize,
        orderBy: { createdAt: 'desc' },
      });

      return ApiResponse.paginated(
        res,
        suppliers,
        { page: validPage, pageSize: validPageSize, totalItems },
        'Suppliers retrieved successfully'
      );

    } catch (error) {
      console.error('Get suppliers error:', error);
      return ApiResponse.serverError(res, 'Failed to retrieve suppliers', error);
    }
  },

  /**
   * Get supplier by ID
   */
  getSupplierById: async (req, res) => {
    try {
      const { id } = req.params;

      const supplier = await prisma.supplier.findUnique({
        where: { id },
        include: {
          products: {
            include: {
              product: true,
            },
          },
          purchaseOrders: {
            take: 10,
            orderBy: { orderDate: 'desc' },
          },
        },
      });

      if (!supplier) {
        return ApiResponse.notFound(res, 'Supplier not found');
      }

      return ApiResponse.success(res, supplier, 'Supplier retrieved successfully');

    } catch (error) {
      console.error('Get supplier error:', error);
      return ApiResponse.serverError(res, 'Failed to retrieve supplier', error);
    }
  },

  /**
   * Create supplier
   */
  createSupplier: async (req, res) => {
    try {
      const {
        supplierName,
        supplierType,
        contactPerson,
        phone,
        email,
        kraPin,
        vatNumber,
        physicalAddress,
        city,
        country,
        paymentTerms,
        bankName,
        bankAccount,
        bankBranch,
        notes,
      } = req.body;

      const supplierCode = validators.generateCode('SUP-', 6);

      const supplier = await prisma.supplier.create({
        data: {
          supplierCode,
          supplierName,
          supplierType: supplierType || null,
          contactPerson: contactPerson || null,
          phone: phone || null,
          email: email || null,
          kraPin: kraPin || null,
          vatNumber: vatNumber || null,
          physicalAddress: physicalAddress || null,
          city: city || null,
          country: country || 'Kenya',
          paymentTerms: paymentTerms ? parseInt(paymentTerms) : 30,
          bankName: bankName || null,
          bankAccount: bankAccount || null,
          bankBranch: bankBranch || null,
          notes: notes || null,
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'SUPPLIER_CREATE',
          description: `Created supplier: ${supplierName}`,
          metadata: { supplierId: supplier.id },
          ipAddress: req.ip,
        },
      });

      return ApiResponse.created(res, supplier, 'Supplier created successfully');

    } catch (error) {
      console.error('Create supplier error:', error);
      return ApiResponse.serverError(res, 'Failed to create supplier', error);
    }
  },

  /**
   * Update supplier
   */
  updateSupplier: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const existingSupplier = await prisma.supplier.findUnique({
        where: { id },
      });

      if (!existingSupplier) {
        return ApiResponse.notFound(res, 'Supplier not found');
      }

      const supplier = await prisma.supplier.update({
        where: { id },
        data: updateData,
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'SUPPLIER_UPDATE',
          description: `Updated supplier: ${supplier.supplierName}`,
          metadata: { supplierId: supplier.id },
          ipAddress: req.ip,
        },
      });

      return ApiResponse.success(res, supplier, 'Supplier updated successfully');

    } catch (error) {
      console.error('Update supplier error:', error);
      return ApiResponse.serverError(res, 'Failed to update supplier', error);
    }
  },
};

module.exports = supplierController;
