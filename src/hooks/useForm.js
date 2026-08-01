import { useState } from 'react';
import { validators } from '../utils/validation';

/**
 * A generic form state and validation hook.
 * 
 * @param {Object} initialValues - The initial state of the form
 * @param {Object} validationRules - An object mapping field names to an array of validator functions
 */
export const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  // Validates a single field against all its rules
  const validateField = (name, value) => {
    if (!validationRules[name]) return null;
    
    for (const rule of validationRules[name]) {
      const error = rule(value);
      if (error) return error; // Return the first error encountered
    }
    return null;
  };

  // Formats and restricts value based on assigned validators
  const formatValue = (name, value) => {
    if (!validationRules[name] || typeof value !== 'string') return value;
    const rules = validationRules[name];
    let formatted = value;

    const hasRule = (validator) => rules.some(r => r === validator || r?.original === validator);

    if (hasRule(validators.mobile)) {
      formatted = formatted.replace(/\D/g, '').slice(0, 10);
    } else if (hasRule(validators.pincode)) {
      formatted = formatted.replace(/\D/g, '').slice(0, 6);
    } else if (hasRule(validators.accountNumber) || hasRule(validators.bankAcCode)) {
      formatted = formatted.replace(/\D/g, '').slice(0, 18);
    } else if (hasRule(validators.numeric)) {
      formatted = formatted.replace(/\D/g, '');
    } else if (hasRule(validators.pan)) {
      let clean = formatted.toUpperCase().replace(/[^A-Z0-9]/g, '');
      let masked = '';
      for (let i = 0; i < clean.length; i++) {
        if (i < 5) masked += (/[A-Z]/.test(clean[i]) ? clean[i] : '');
        else if (i < 9) masked += (/[0-9]/.test(clean[i]) ? clean[i] : '');
        else if (i < 10) masked += (/[A-Z]/.test(clean[i]) ? clean[i] : '');
      }
      formatted = masked.slice(0, 10);
    } else if (hasRule(validators.gst)) {
      let clean = formatted.toUpperCase().replace(/[^A-Z0-9]/g, '');
      let masked = '';
      for (let i = 0; i < clean.length && i < 15; i++) {
        if (i < 2) masked += (/[0-9]/.test(clean[i]) ? clean[i] : '');
        else if (i < 7) masked += (/[A-Z]/.test(clean[i]) ? clean[i] : '');
        else if (i < 11) masked += (/[0-9]/.test(clean[i]) ? clean[i] : '');
        else if (i < 12) masked += (/[A-Z]/.test(clean[i]) ? clean[i] : '');
        else if (i === 12) masked += (/[1-9A-Z]/.test(clean[i]) ? clean[i] : '');
        else if (i === 13) masked += 'Z'; // 14th char is almost always Z, enforce it
        else if (i === 14) masked += (/[0-9A-Z]/.test(clean[i]) ? clean[i] : '');
      }
      formatted = masked;
    } else if (hasRule(validators.cin)) {
      let clean = formatted.toUpperCase().replace(/[^A-Z0-9]/g, '');
      let masked = '';
      for (let i = 0; i < clean.length && i < 21; i++) {
        if (i === 0) masked += (/[LU]/.test(clean[i]) ? clean[i] : '');
        else if (i < 6) masked += (/[0-9]/.test(clean[i]) ? clean[i] : '');
        else if (i < 8) masked += (/[A-Z]/.test(clean[i]) ? clean[i] : '');
        else if (i < 12) masked += (/[0-9]/.test(clean[i]) ? clean[i] : '');
        else if (i < 15) masked += (/[A-Z]/.test(clean[i]) ? clean[i] : '');
        else if (i < 21) masked += (/[0-9]/.test(clean[i]) ? clean[i] : '');
      }
      formatted = masked;
    } else if (hasRule(validators.ifsc)) {
      let clean = formatted.toUpperCase().replace(/[^A-Z0-9]/g, '');
      let masked = '';
      for (let i = 0; i < clean.length && i < 11; i++) {
        if (i < 4) masked += (/[A-Z]/.test(clean[i]) ? clean[i] : '');
        else if (i === 4) {
          // 5th character must be 0 (allow user typing O by mistake to be converted to 0)
          if (clean[i] === '0' || clean[i] === 'O') masked += '0';
        }
        else if (i < 11) masked += (/[A-Z0-9]/.test(clean[i]) ? clean[i] : '');
      }
      formatted = masked;
    }

    return formatted;
  };

  // Handles input change and real-time validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Apply strict formatting/masking based on rules before updating state
    const formattedValue = formatValue(name, value);
    
    setValues((prev) => ({ ...prev, [name]: formattedValue }));
    
    // Validate on change
    const error = validateField(name, formattedValue);
    setErrors((prev) => ({
      ...prev,
      [name]: error
    }));
  };

  // Validates all fields (useful before form submission)
  const validateAll = () => {
    const newErrors = {};
    let isValid = true;
    
    Object.keys(validationRules).forEach((name) => {
      const value = values[name] || '';
      const error = validateField(name, value);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Manual override if needed
  const setFieldValue = (name, value) => {
    const formattedValue = formatValue(name, value);
    setValues((prev) => ({ ...prev, [name]: formattedValue }));
    const error = validateField(name, formattedValue);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  return { 
    values, 
    errors, 
    handleChange, 
    validateAll,
    setValues,
    setFieldValue,
    setErrors
  };
};

export default useForm;
