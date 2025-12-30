// Validation utilities for Excel import

export const validateRequired = (value, fieldName) => {
    if (!value || value.toString().trim() === '') {
        return `${fieldName} is required`;
    }
    return null;
};

export const validateEmail = (email) => {
    if (!email) return null; // Optional field
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
        return 'Invalid email format';
    }
    return null;
};

export const validatePhone = (phone) => {
    if (!phone) return null; // Optional field
    const cleaned = phone.toString().replace(/[^0-9]/g, '');
    if (cleaned.length < 10 || cleaned.length > 11) {
        return 'Phone number must be 10-11 digits';
    }
    return null;
};

export const validateEnum = (value, allowedValues, fieldName) => {
    if (!value) return null; // Optional field
    if (!allowedValues.includes(value)) {
        return `${fieldName} must be one of: ${allowedValues.join(', ')}`;
    }
    return null;
};

export const validateDate = (dateStr) => {
    if (!dateStr) return null; // Optional field
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        return 'Invalid date format (use YYYY-MM-DD)';
    }
    return null;
};

export const validateNumber = (value, fieldName) => {
    if (!value) return null; // Optional field
    const num = parseFloat(value);
    if (isNaN(num)) {
        return `${fieldName} must be a valid number`;
    }
    return null;
};

export const validateInteger = (value, fieldName) => {
    if (!value) return null; // Optional field
    const num = parseInt(value);
    if (isNaN(num) || num.toString() !== value.toString()) {
        return `${fieldName} must be a valid integer`;
    }
    return null;
};

export const validateBoolean = (value) => {
    if (!value) return null; // Optional field
    const validValues = ['YES', 'NO', 'TRUE', 'FALSE', '1', '0', true, false];
    if (!validValues.includes(value)) {
        return 'Must be YES/NO or TRUE/FALSE';
    }
    return null;
};

export const parseBoolean = (value) => {
    if (!value) return false;
    const str = value.toString().toUpperCase();
    return str === 'YES' || str === 'TRUE' || str === '1';
};
