/**
 * Product Controller
 * Helvino Technologies Limited
 */

const { prisma } = require('../config/database');
const ApiResponse = require('../utils/response');
const validators = require('../utils/validators');
const helpers = require('../utils/helpers');

const productController = {
  /**
   * Get all products with pagination and filters
   */
  getAllProducts: async (req, res) => {
    try {
      const { 
        page = 1, 
        pageSize = 20,
        search,
        categoryId,
        productType,
        isActive,
        barcode,
      } = req.query;

      const { page: validPage, pageSize: validPageSize } = 
        validators.validatePagination(page, pageSize);

      const offset = helpers.getPaginationOffset(validPage, validPageSize);

      // Build where clause
      const where = {};

      if (search) {
        where.OR = [
          { productName: { contains: search, mode: 'insensitive' } },
          { productCode: { contains: search, mode: 'insensitive' } },
          { barcode: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (productType) {
        where.productType = productType;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      if (barcode) {
        where.barcode = barcode;
      }

      // Get total count
      const totalItems = await prisma.product.count({ where });

      // Get products
      const products = await prisma.product.findMany({
        where,
        include: {
          category: true,
          unitOfMeasure: true,
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
        products,
        { page: validPage, pageSize: validPageSize, totalItems },
        'Products retrieved successfully'
      );

    } catch (error) {
      console.error('Get products error:', error);
      return ApiResponse.serverError(res, 'Failed to retrieve products', error);
    }
  },

  /**
   * Get product by ID
   */
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          unitOfMeasure: true,
          creator: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
          variants: true,
          assembliesParent: {
            include: {
              componentProduct: true,
            },
          },
          stock: {
            include: {
              branch: true,
              location: true,
            },
          },
        },
      });

      if (!product) {
        return ApiResponse.notFound(res, 'Product not found');
      }

      return ApiResponse.success(res, product, 'Product retrieved successfully');

    } catch (error) {
      console.error('Get product error:', error);
      return ApiResponse.serverError(res, 'Failed to retrieve product', error);
    }
  },

  /**
   * Get product by barcode
   */
  getProductByBarcode: async (req, res) => {
    try {
      const { barcode } = req.params;

      const product = await prisma.product.findUnique({
        where: { barcode },
        include: {
          category: true,
          unitOfMeasure: true,
          stock: {
            where: {
              branchId: req.user.branchId,
            },
          },
        },
      });

      if (!product) {
        return ApiResponse.notFound(res, 'Product not found');
      }

      return ApiResponse.success(res, product, 'Product retrieved successfully');

    } catch (error) {
      console.error('Get product by barcode error:', error);
      return ApiResponse.serverError(res, 'Failed to retrieve product', error);
    }
  },

  /**
   * Create new product
   */
  createProduct: async (req, res) => {
    try {
      const {
        productCode,
        barcode,
        productName,
        categoryId,
        productType,
        unitOfMeasureId,
        length,
        width,
        height,
        thickness,
        weightPerUnit,
        costPrice,
        retailPrice,
        tradePrice,
        wholesalePrice,
        markupPercentage,
        trackSerials,
        trackBatches,
        trackDimensions,
        allowFractionalQty,
        reorderLevel,
        reorderQuantity,
        maxStockLevel,
        description,
        specifications,
        supplierId,
        brand,
        warrantyMonths,
        isTaxable,
        taxRate,
      } = req.body;

      // Check if product code already exists
      const existingProduct = await prisma.product.findUnique({
        where: { productCode },
      });

      if (existingProduct) {
        return ApiResponse.conflict(res, 'Product code already exists');
      }

      // Check if barcode already exists
      if (barcode) {
        const existingBarcode = await prisma.product.findUnique({
          where: { barcode },
        });

        if (existingBarcode) {
          return ApiResponse.conflict(res, 'Barcode already exists');
        }
      }

      // Create product
      const product = await prisma.product.create({
        data: {
          productCode,
          barcode: barcode || null,
          productName,
          categoryId: categoryId || null,
          productType,
          unitOfMeasureId: unitOfMeasureId || null,
          length: length ? parseFloat(length) : null,
          width: width ? parseFloat(width) : null,
          height: height ? parseFloat(height) : null,
          thickness: thickness ? parseFloat(thickness) : null,
          weightPerUnit: weightPerUnit ? parseFloat(weightPerUnit) : null,
          costPrice: costPrice ? parseFloat(costPrice) : null,
          retailPrice: parseFloat(retailPrice),
          tradePrice: tradePrice ? parseFloat(tradePrice) : null,
          wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : null,
          markupPercentage: markupPercentage ? parseFloat(markupPercentage) : null,
          trackSerials: trackSerials || false,
          trackBatches: trackBatches || false,
          trackDimensions: trackDimensions || false,
          allowFractionalQty: allowFractionalQty || false,
          reorderLevel: reorderLevel ? parseFloat(reorderLevel) : null,
          reorderQuantity: reorderQuantity ? parseFloat(reorderQuantity) : null,
          maxStockLevel: maxStockLevel ? parseFloat(maxStockLevel) : null,
          description: description || null,
          specifications: specifications || null,
          supplierId: supplierId || null,
          brand: brand || null,
          warrantyMonths: warrantyMonths ? parseInt(warrantyMonths) : null,
          isTaxable: isTaxable !== undefined ? isTaxable : true,
          taxRate: taxRate ? parseFloat(taxRate) : 16.00,
          createdBy: req.user.id,
        },
        include: {
          category: true,
          unitOfMeasure: true,
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'PRODUCT_CREATE',
          description: `Created product: ${productName}`,
          metadata: { productId: product.id },
          ipAddress: req.ip,
        },
      });

      return ApiResponse.created(res, product, 'Product created successfully');

    } catch (error) {
      console.error('Create product error:', error);
      return ApiResponse.serverError(res, 'Failed to create product', error);
    }
  },

  /**
   * Update product
   */
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if product exists
      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        return ApiResponse.notFound(res, 'Product not found');
      }

      // Check if barcode is being changed and already exists
      if (updateData.barcode && updateData.barcode !== existingProduct.barcode) {
        const barcodeExists = await prisma.product.findUnique({
          where: { barcode: updateData.barcode },
        });

        if (barcodeExists) {
          return ApiResponse.conflict(res, 'Barcode already exists');
        }
      }

      // Prepare update data
      const dataToUpdate = {};

      // Only update fields that are provided
      const fieldsToUpdate = [
        'barcode', 'productName', 'categoryId', 'productType', 
        'unitOfMeasureId', 'length', 'width', 'height', 'thickness',
        'weightPerUnit', 'costPrice', 'retailPrice', 'tradePrice',
        'wholesalePrice', 'markupPercentage', 'trackSerials', 'trackBatches',
        'trackDimensions', 'allowFractionalQty', 'reorderLevel',
        'reorderQuantity', 'maxStockLevel', 'description', 'specifications',
        'supplierId', 'brand', 'warrantyMonths', 'isActive', 'isTaxable', 'taxRate',
      ];

      fieldsToUpdate.forEach(field => {
        if (updateData[field] !== undefined) {
          dataToUpdate[field] = updateData[field];
        }
      });

      // Update product
      const product = await prisma.product.update({
        where: { id },
        data: dataToUpdate,
        include: {
          category: true,
          unitOfMeasure: true,
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'PRODUCT_UPDATE',
          description: `Updated product: ${product.productName}`,
          metadata: { productId: product.id },
          ipAddress: req.ip,
        },
      });

      return ApiResponse.success(res, product, 'Product updated successfully');

    } catch (error) {
      console.error('Update product error:', error);
      return ApiResponse.serverError(res, 'Failed to update product', error);
    }
  },

  /**
   * Delete product (soft delete)
   */
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        return ApiResponse.notFound(res, 'Product not found');
      }

      // Soft delete by setting isActive to false
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'PRODUCT_DELETE',
          description: `Deleted product: ${product.productName}`,
          metadata: { productId: product.id },
          ipAddress: req.ip,
        },
      });

      return ApiResponse.success(res, null, 'Product deleted successfully');

    } catch (error) {
      console.error('Delete product error:', error);
      return ApiResponse.serverError(res, 'Failed to delete product', error);
    }
  },

  /**
   * Get low stock products
   */
  getLowStockProducts: async (req, res) => {
    try {
      const { branchId } = req.query;

      const where = {
        isActive: true,
        reorderLevel: { not: null },
      };

      // Get products with stock information
      const products = await prisma.product.findMany({
        where,
        include: {
          category: true,
          stock: {
            where: branchId ? { branchId } : {},
            include: {
              branch: true,
            },
          },
        },
      });

      // Filter products where stock is below reorder level
      const lowStockProducts = products.filter(product => {
        if (product.stock.length === 0) return true;
        
        return product.stock.some(stock => 
          parseFloat(stock.availableQuantity) <= parseFloat(product.reorderLevel)
        );
      });

      return ApiResponse.success(
        res,
        lowStockProducts,
        'Low stock products retrieved successfully'
      );

    } catch (error) {
      console.error('Get low stock products error:', error);
      return ApiResponse.serverError(res, 'Failed to retrieve low stock products', error);
    }
  },

  /**
   * Bulk import products
   */
  bulkImportProducts: async (req, res) => {
    try {
      const { products } = req.body;

      if (!Array.isArray(products) || products.length === 0) {
        return ApiResponse.badRequest(res, 'Products array is required');
      }

      const results = {
        success: 0,
        failed: 0,
        errors: [],
      };

      for (const productData of products) {
        try {
          // Check if product code exists
          const exists = await prisma.product.findUnique({
            where: { productCode: productData.productCode },
          });

          if (exists) {
            results.failed++;
            results.errors.push({
              productCode: productData.productCode,
              error: 'Product code already exists',
            });
            continue;
          }

          await prisma.product.create({
            data: {
              ...productData,
              createdBy: req.user.id,
            },
          });

          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            productCode: productData.productCode,
            error: error.message,
          });
        }
      }

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'PRODUCT_BULK_IMPORT',
          description: `Bulk imported products: ${results.success} success, ${results.failed} failed`,
          metadata: results,
          ipAddress: req.ip,
        },
      });

      return ApiResponse.success(res, results, 'Bulk import completed');

    } catch (error) {
      console.error('Bulk import error:', error);
      return ApiResponse.serverError(res, 'Failed to import products', error);
    }
  },

  /**
   * Get product stock summary
   */
  getProductStock: async (req, res) => {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          stock: {
            include: {
              branch: true,
              location: true,
            },
          },
          dimensionalStock: {
            where: {
              stockStatus: { not: 'damaged' },
            },
            include: {
              branch: true,
              location: true,
            },
          },
          serialNumbers: {
            where: {
              stockStatus: 'in_stock',
            },
            include: {
              branch: true,
              location: true,
            },
          },
        },
      });

      if (!product) {
        return ApiResponse.notFound(res, 'Product not found');
      }

      // Calculate total stock across all branches
      const totalStock = product.stock.reduce((sum, s) => 
        sum + parseFloat(s.availableQuantity), 0
      );

      const stockSummary = {
        product: {
          id: product.id,
          productCode: product.productCode,
          productName: product.productName,
          productType: product.productType,
        },
        totalStock,
        stockByBranch: product.stock,
        dimensionalStock: product.dimensionalStock,
        serialNumbers: product.serialNumbers,
      };

      return ApiResponse.success(
        res,
        stockSummary,
        'Product stock retrieved successfully'
      );

    } catch (error) {
      console.error('Get product stock error:', error);
      return ApiResponse.serverError(res, 'Failed to retrieve product stock', error);
    }
  },
};

module.exports = productController;
