/**
 * Customer Controller
 * Helvino Technologies Limited
 */

const { prisma } = require('../config/database');
const ApiResponse = require('../utils/response');
const validators = require('../utils/validators');
const helpers = require('../utils/helpers');

const customerController = {
  /**
   * Get all customers with pagination and filters
   */
  getAllCustomers: async (req, res) => {
    try {
      const {
        page = 1,
        pageSize = 20,
        search,
        customerType,
        creditStatus,
        isActive,
      } = req.query;

      const { page: validPage, pageSize: validPageSize } =
        validators.validatePagination(page, pageSize);

      const offset = helpers.getPaginationOffset(validPage, validPageSize);

      // Build where clause
      const where = {};

      if (search) {
        where.OR = [
          { customerName: { contains: search, mode: 'insensitive' } },
          { customerCode: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { kraPin: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (customerType) {
        where.customerType = customerType;
      }

      if (creditStatus) {
        where.creditStatus = creditStatus;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      // Get total count
      const totalItems = await prisma.customer.count({ where });

      // Get customers
      const customers = await prisma.customer.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        skip: offset,
        take: validPageSize,
        orderBy: { createdAt: 'desc' },
      });

      return ApiResponse.paginated(
        res,
        customers,
        { page: validPage, pageSize: validPageSize, totalItems },
        'Customers retrieved successfully'
      );

    } catch (error) {
      console.error('Get customers error:', error);
      return ApiResponse.serverError(res, 'Failed to retrieve customers', error);
    }
  },

  /**
   * Get customer by ID
   */
  getCustomerById: async (req, res) => {
    try {
      const { id } = req.params;

      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          projects: true,
          sales: {
            take: 10,
            orderBy: { saleDate: 'desc' },
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      if (!customer) {
        return ApiResponse.notFound(res, 'Customer not found');
      }

      return ApiResponse.success(res, customer, 'Customer retrieved successfully');

    } catch (error) {
      console.error('Get customer error:', error);
      return ApiResponse.serverError(res, 'Failed to retrieve customer', error);
    }
  },

  /**
   * Create new customer
   */
  createCustomer: async (req, res) => {
    try {
      const {
        customerType,
        customerName,
        contactPerson,
        phone,
        email,
        companyName,
        tradeLicenseNo,
        kraPin,
        vatNumber,
        physicalAddress,
        city,
        postalAddress,
        creditLimit,
        paymentTerms,
        discountTier,
        discountPercentage,
        defaultDeliveryAddress,
        deliveryInstructions,
      } = req.body;

      // Validate phone if provided
      if (phone && !validators.isValidPhone(phone)) {
        return ApiResponse.badRequest(res, 'Invalid phone number format');
      }

      // Validate email if provided
      if (email && !validators.isValidEmail(email)) {
        return ApiResponse.badRequest(res, 'Invalid email format');
      }

      // Generate customer code
      const customerCode = validators.generateCode('CUS-', 6);

      // Create customer
      const customer = await prisma.customer.create({
        data: {
          customerCode,
          customerType,
          customerName,
          contactPerson: contactPerson || null,
          phone: phone || null,
          email: email || null,
          companyName: companyName || null,
          tradeLicenseNo: tradeLicenseNo || null,
          kraPin: kraPin || null,
          vatNumber: vatNumber || null,
          physicalAddress: physicalAddress || null,
          city: city || null,
          postalAddress: postalAddress || null,
          creditLimit: creditLimit ? parseFloat(creditLimit) : 0,
          paymentTerms: paymentTerms ? parseInt(paymentTerms) : 30,
          discountTier: discountTier || null,
          discountPercentage: discountPercentage ? parseFloat(discountPercentage) : 0,
          defaultDeliveryAddress: defaultDeliveryAddress || null,
          deliveryInstructions: deliveryInstructions || null,
          createdBy: req.user.id,
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'CUSTOMER_CREATE',
          description: `Created customer: ${customerName}`,
          metadata: { customerId: customer.id },
          ipAddress: req.ip,
        },
      });

      return ApiResponse.created(res, customer, 'Customer created successfully');

    } catch (error) {
      console.error('Create customer error:', error);
      return ApiResponse.serverError(res, 'Failed to create customer', error);
    }
  },

  /**
   * Update customer
   */
  updateCustomer: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if customer exists
      const existingCustomer = await prisma.customer.findUnique({
        where: { id },
      });

      if (!existingCustomer) {
        return ApiResponse.notFound(res, 'Customer not found');
      }

      // Validate phone if provided
      if (updateData.phone && !validators.isValidPhone(updateData.phone)) {
        return ApiResponse.badRequest(res, 'Invalid phone number format');
      }

      // Validate email if provided
      if (updateData.email && !validators.isValidEmail(updateData.email)) {
        return ApiResponse.badRequest(res, 'Invalid email format');
      }

      // Update customer
      const customer = await prisma.customer.update({
        where: { id },
        data: updateData,
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          activityType: 'CUSTOMER_UPDATE',
          description: `Updated customer: ${customer.customerName}`,
          metadata: { customerId: customer.id },
          ipAddress: req.ip,
        },
      });

      return ApiResponse.success(res, customer, 'Customer updated successfully');

    } catch (error) {
      console.error('Update customer error:', error);
      return ApiResponse.serverError(res, 'Failed to update customer', error);
    }
  },

  /**
   * Get customer statement
   */
  getCustomerStatement: async (req, res) => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const customer = await prisma.customer.findUnique({
        where: { id },
      });

      if (!customer) {
        return ApiResponse.notFound(res, 'Customer not found');
      }

      // Build date filter
      const dateFilter = {};
      if (startDate || endDate) {
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          dateFilter.lte = end;
        }
      }

      // Get sales
      const sales = await prisma.sale.findMany({
        where: {
          customerId: id,
          ...(Object.keys(dateFilter).length > 0 && { saleDate: dateFilter }),
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { saleDate: 'desc' },
      });

      // Get payments
      const payments = await prisma.payment.findMany({
        where: {
          customerId: id,
          ...(Object.keys(dateFilter).length > 0 && { paymentDate: dateFilter }),
        },
        orderBy: { paymentDate: 'desc' },
      });

      const statement = {
        customer: {
          id: customer.id,
          customerCode: customer.customerCode,
          customerName: customer.customerName,
          currentBalance: parseFloat(customer.currentBalance),
          creditLimit: parseFloat(customer.creditLimit),
          availableCredit: parseFloat(customer.creditLimit) - parseFloat(customer.currentBalance),
        },
        sales,
        payments,
        summary: {
          totalSales: sales.reduce((sum, s) => sum + parseFloat(s.totalAmount), 0),
          totalPayments: payments.reduce((sum, p) => sum + parseFloat(p.amount), 0),
          outstandingBalance: parseFloat(customer.currentBalance),
        },
      };

      return ApiResponse.success(res, statement, 'Customer statement retrieved successfully');

    } catch (error) {
      console.error('Get customer statement error:', error);
      return ApiResponse.serverError(res, 'Failed to retrieve customer statement', error);
    }
  },
};

module.exports = customerController;
