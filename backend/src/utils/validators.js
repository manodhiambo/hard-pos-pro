/**
 * Common Validation Functions
 * Helvino Technologies Limited
 */

const validators = {
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone: (phone) => {
    // Kenyan phone format: 07XX XXX XXX or +2547XX XXX XXX
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  isValidKRAPin: (pin) => {
    // KRA PIN format: AXXXXXXXXX (letter followed by 9 digits and letter)
    const kraRegex = /^[A-Z]\d{9}[A-Z]$/;
    return kraRegex.test(pin);
  },

  isValidBarcode: (barcode) => {
    return barcode && barcode.length >= 8 && barcode.length <= 100;
  },

  isPositiveNumber: (value) => {
    return !isNaN(value) && parseFloat(value) > 0;
  },

  isNonNegativeNumber: (value) => {
    return !isNaN(value) && parseFloat(value) >= 0;
  },

  sanitizeString: (str) => {
    if (!str) return '';
    return str.trim().replace(/[<>]/g, '');
  },

  validatePagination: (page, pageSize) => {
    const validPage = Math.max(1, parseInt(page) || 1);
    const validPageSize = Math.min(
      Math.max(1, parseInt(pageSize) || 20),
      parseInt(process.env.MAX_PAGE_SIZE) || 100
    );
    return { page: validPage, pageSize: validPageSize };
  },

  validateDateRange: (startDate, endDate) => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && isNaN(start.getTime())) {
      throw new Error('Invalid start date');
    }

    if (end && isNaN(end.getTime())) {
      throw new Error('Invalid end date');
    }

    if (start && end && start > end) {
      throw new Error('Start date must be before end date');
    }

    return { startDate: start, endDate: end };
  },

  generateCode: (prefix, length = 6) => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, length).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  },

  generateReceiptNumber: () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `RCP${year}${month}${day}${random}`;
  },
};

module.exports = validators;
