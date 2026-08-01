/**
 * Generic Validation Rules
 * Returns an error message string if invalid, or null if valid.
 */

export const validators = {
  required: (value) => {
    if (value === undefined || value === null || value === '') {
      return 'This field is required';
    }
    return null;
  },

  email: (value) => {
    if (!value) return null; // Let required() handle empty check if needed
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Invalid email address';
  },

  mobile: (value) => {
    if (!value) return null;
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(value) ? null : 'Mobile number must be 10 digits';
  },

  pincode: (value) => {
    if (!value) return null;
    const pinRegex = /^[0-9]{6}$/;
    return pinRegex.test(value) ? null : 'Pin code must be 6 digits';
  },

  pan: (value) => {
    if (!value) return null;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(value.toUpperCase()) ? null : 'Invalid PAN format (e.g. ABCDE1234F)';
  },

  gst: (value) => {
    if (!value) return null;
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(value.toUpperCase()) ? null : 'Invalid GST format (e.g. 22AAAAA0000A1Z5)';
  },

  date: (value) => {
    if (!value) return null;
    const dateRegex = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;
    return dateRegex.test(value) ? null : 'Invalid date format';
  },

  accountNumber: (value) => {
    if (!value) return null;
    const acRegex = /^[0-9]{9,18}$/;
    return acRegex.test(value) ? null : 'Account number must be 9-18 digits';
  },

  cin: (value) => {
    if (!value) return null;
    // Standard Indian CIN format: 21 alphanumeric characters
    // Example: U12345MH2021PTC123456
    const cinRegex = /^[LUlu]\d{5}[A-Za-z]{2}\d{4}[A-Za-z]{3}\d{6}$/;
    return cinRegex.test(value) ? null : 'Invalid CIN format (e.g., U12345MH2021PTC123456)';
  },

  // Custom validator for generic length or custom regex if needed
  pattern: (regex, errorMessage) => (value) => {
    if (!value) return null;
    return regex.test(value) ? null : errorMessage;
  },

  percentage: (value) => {
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    if (isNaN(num) || num < 0 || num > 100) {
      return 'Percentage must be between 0 and 100';
    }
    return null;
  },

  numeric: (value) => {
    if (!value) return null;
    return /^[0-9]+$/.test(value) ? null : 'Must contain numbers only';
  },

  bankAcCode: (value) => {
    if (!value) return null;
    return /^[0-9]{9,18}$/.test(value) ? null : 'Account number must be 9-18 digits';
  },

  ifsc: (value) => {
    if (!value) return null;
    // Standard IFSC format: 4 alphabets, 1 zero, 6 alphanumeric (e.g. SBIN0001234)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(value.toUpperCase()) ? null : 'Invalid IFSC code format (e.g. SBIN0001234)';
  },

  upi: (value) => {
    if (!value) return null;
    // Standard UPI format: username@bankname
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    return upiRegex.test(value) ? null : 'Invalid UPI ID format (e.g. username@bank)';
  }
};

// Globally attach .withMessage(customMsg) to all validators so they can be overridden inline
Object.keys(validators).forEach(key => {
  const original = validators[key];
  if (typeof original === 'function' && key !== 'pattern') {
    original.original = original;
    original.withMessage = (customMsg) => {
      const wrapped = (value) => {
        const result = original(value);
        return result ? customMsg : null;
      };
      wrapped.original = original;
      return wrapped;
    };
  }
});
