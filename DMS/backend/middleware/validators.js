import { body, query, validationResult } from 'express-validator';

// Middleware to check validation results
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Validation errors:', JSON.stringify(errors.array(), null, 2));
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Inventory Validators
export const inventoryValidators = {
    createWarehouse: [
        body('code').trim().notEmpty().withMessage('Mã kho là bắt buộc').isLength({ max: 20 }).withMessage('Mã kho tối đa 20 ký tự'),
        body('name').trim().notEmpty().withMessage('Tên kho là bắt buộc'),
        body('managerId').optional({ checkFalsy: true }).isUUID().withMessage('ID quản lý không hợp lệ')
    ],
    updateStock: [
        body('quantity').isInt({ min: 0 }).withMessage('Số lượng phải là số dương'),
        body('reason').optional().isString()
    ],
    getTransactions: [
        query('startDate').optional().isISO8601().withMessage('Ngày bắt đầu không hợp lệ'),
        query('endDate').optional().isISO8601().withMessage('Ngày kết thúc không hợp lệ')
    ],
    createTransaction: [
        body('type').isIn(['IMPORT', 'EXPORT']).withMessage('Loại giao dịch không hợp lệ'),
        body('warehouseId').notEmpty().withMessage('Kho là bắt buộc'),
        body('items').isArray({ min: 1 }).withMessage('Phải có ít nhất 1 sản phẩm'),
        body('items.*.productId').notEmpty().withMessage('Mã sản phẩm là bắt buộc'),
        body('items.*.quantity').isInt({ min: 1 }).withMessage('Số lượng phải lớn hơn 0')
    ]
};
