// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone (Kenyan format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+254|0)[17]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Validate KRA PIN
export const isValidKRAPin = (pin: string): boolean => {
  const kraRegex = /^[A-Z]\d{9}[A-Z]$/;
  return kraRegex.test(pin);
};

// Validate required field
export const isRequired = (value: any): boolean => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value);
  return value !== null && value !== undefined;
};

// Validate min length
export const minLength = (value: string, length: number): boolean => {
  return value.trim().length >= length;
};

// Validate max length
export const maxLength = (value: string, length: number): boolean => {
  return value.trim().length <= length;
};

// Validate positive number
export const isPositive = (value: number): boolean => {
  return !isNaN(value) && value > 0;
};

// Validate non-negative number
export const isNonNegative = (value: number): boolean => {
  return !isNaN(value) && value >= 0;
};
