import { body, param, query, validationResult } from 'express-validator';
import logger from '../lib/logger.js';

// Middleware để xử lý validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Validation errors:', {
      url: req.url,
      method: req.method,
      errors: errors.array()
    });
    
    return res.status(400).json({
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array()
    });
  }
  
  next();
};

// Validation rules cho authentication
export const validateLogin = [
  body('employeeCode')
    .trim()
    .notEmpty()
    .withMessage('Mã NV là bắt buộc')
    .isLength({ min: 2, max: 20 })
    .withMessage('Mã NV phải từ 2-20 ký tự')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Mã NV chỉ chứa chữ cái in hoa và số'),
  
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  
  handleValidationErrors
];

export const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tên là bắt buộc')
    .isLength({ min: 2, max: 100 })
    .withMessage('Tên phải từ 2-100 ký tự'),
  
  body('email')
    .trim()
    .optional()
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số'),
  
  body('role')
    .optional()
    .isIn(['USER', 'ADMIN', 'TDV', 'PHARMACY_REP', 'DELIVERY'])
    .withMessage('Role không hợp lệ'),
  
  handleValidationErrors
];

// Validation rules cho pharmacy
export const validatePharmacy = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tên nhà thuốc là bắt buộc')
    .isLength({ min: 2, max: 200 })
    .withMessage('Tên nhà thuốc phải từ 2-200 ký tự'),
  
  body('phone')
    .trim()
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại không hợp lệ'),
  
  body('address')
    .trim()
    .optional()
    .isLength({ max: 500 })
    .withMessage('Địa chỉ không được quá 500 ký tự'),
  
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude không hợp lệ'),
  
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude không hợp lệ'),
  
  handleValidationErrors
];

// Validation rules cho order
export const validateOrder = [
  body('pharmacyId')
    .notEmpty()
    .withMessage('ID nhà thuốc là bắt buộc')
    .isString()
    .withMessage('ID nhà thuốc không hợp lệ'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('Phải có ít nhất 1 sản phẩm trong đơn hàng'),
  
  body('items.*.productId')
    .notEmpty()
    .withMessage('ID sản phẩm là bắt buộc'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Số lượng phải là số nguyên dương'),
  
  handleValidationErrors
];

// Validation rules cho user
export const validateUser = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tên là bắt buộc')
    .isLength({ min: 2, max: 100 })
    .withMessage('Tên phải từ 2-100 ký tự'),
  
  body('employeeCode')
    .trim()
    .notEmpty()
    .withMessage('Mã NV là bắt buộc')
    .isLength({ min: 2, max: 20 })
    .withMessage('Mã NV phải từ 2-20 ký tự')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Mã NV chỉ chứa chữ cái in hoa và số'),
  
  body('email')
    .trim()
    .optional()
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại không hợp lệ'),
  
  body('role')
    .optional()
    .isIn(['USER', 'ADMIN', 'TDV', 'PHARMACY_REP', 'DELIVERY'])
    .withMessage('Role không hợp lệ'),
  
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  
  handleValidationErrors
];

// Validation rules cho ID parameter
export const validateId = [
  param('id')
    .notEmpty()
    .withMessage('ID là bắt buộc')
    .isString()
    .withMessage('ID không hợp lệ'),
  
  handleValidationErrors
];

// Validation rules cho pagination
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page phải là số nguyên dương'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit phải từ 1-100'),
  
  handleValidationErrors
];

