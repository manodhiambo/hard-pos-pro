/**
 * Helper Utility Functions
 * Helvino Technologies Limited
 */

const helpers = {
  /**
   * Calculate pagination offset
   */
  getPaginationOffset: (page, pageSize) => {
    return (page - 1) * pageSize;
  },

  /**
   * Format currency (Kenyan Shillings)
   */
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  },

  /**
   * Calculate percentage
   */
  calculatePercentage: (value, total) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(2);
  },

  /**
   * Calculate tax amount
   */
  calculateTax: (amount, taxRate = 16) => {
    return (amount * (taxRate / 100)).toFixed(2);
  },

  /**
   * Calculate discount amount
   */
  calculateDiscount: (amount, discountPercentage) => {
    return (amount * (discountPercentage / 100)).toFixed(2);
  },

  /**
   * Calculate line total with tax and discount
   */
  calculateLineTotal: (quantity, unitPrice, discountPercentage = 0, taxRate = 16) => {
    const subtotal = quantity * unitPrice;
    const discount = subtotal * (discountPercentage / 100);
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * (taxRate / 100);
    return (taxableAmount + tax).toFixed(2);
  },

  /**
   * Generate unique barcode
   */
  generateBarcode: (prefix = 'HRD') => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${timestamp}${random}`;
  },

  /**
   * Format date to YYYY-MM-DD
   */
  formatDate: (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  },

  /**
   * Format datetime to readable format
   */
  formatDateTime: (date) => {
    if (!date) return null;
    return new Date(date).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /**
   * Calculate days between dates
   */
  daysBetween: (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
  },

  /**
   * Check if date is overdue
   */
  isOverdue: (dueDate) => {
    return new Date(dueDate) < new Date();
  },

  /**
   * Calculate stock value
   */
  calculateStockValue: (quantity, costPrice) => {
    return (quantity * costPrice).toFixed(2);
  },

  /**
   * Calculate profit margin
   */
  calculateProfitMargin: (costPrice, sellingPrice) => {
    if (costPrice === 0) return 0;
    return (((sellingPrice - costPrice) / costPrice) * 100).toFixed(2);
  },

  /**
   * Generate random string
   */
  generateRandomString: (length = 10) => {
    return Math.random().toString(36).substring(2, length + 2).toUpperCase();
  },

  /**
   * Chunk array into smaller arrays
   */
  chunkArray: (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  /**
   * Remove duplicates from array
   */
  removeDuplicates: (array, key = null) => {
    if (!key) {
      return [...new Set(array)];
    }
    return array.filter((item, index, self) =>
      index === self.findIndex((t) => t[key] === item[key])
    );
  },

  /**
   * Sleep/delay function
   */
  sleep: (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Format phone number to Kenyan format
   */
  formatPhoneNumber: (phone) => {
    if (!phone) return null;
    // Remove spaces and special characters
    let cleaned = phone.replace(/\D/g, '');
    // Convert to international format
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    return cleaned;
  },

  /**
   * Validate M-Pesa transaction code format
   */
  isValidMpesaCode: (code) => {
    // M-Pesa codes are typically 10 characters alphanumeric
    const mpesaRegex = /^[A-Z0-9]{10}$/;
    return mpesaRegex.test(code);
  },

  /**
   * Calculate cutting waste percentage
   */
  calculateWastePercentage: (originalLength, usedLength) => {
    if (originalLength === 0) return 0;
    const waste = originalLength - usedLength;
    return ((waste / originalLength) * 100).toFixed(2);
  },

  /**
   * Convert units
   */
  convertUnit: (value, fromUnit, toUnit, conversionRates) => {
    if (fromUnit === toUnit) return value;
    const rate = conversionRates[`${fromUnit}_to_${toUnit}`];
    return rate ? (value * rate).toFixed(3) : value;
  },

  /**
   * Generate invoice number
   */
  generateInvoiceNumber: (prefix = 'INV') => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}${month}-${random}`;
  },

  /**
   * Safely parse JSON
   */
  safeJsonParse: (jsonString, defaultValue = null) => {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      return defaultValue;
    }
  },

  /**
   * Deep clone object
   */
  deepClone: (obj) => {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Check if object is empty
   */
  isEmpty: (obj) => {
    return Object.keys(obj).length === 0;
  },

  /**
   * Capitalize first letter
   */
  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Generate slug from string
   */
  slugify: (str) => {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },
};

module.exports = helpers;
