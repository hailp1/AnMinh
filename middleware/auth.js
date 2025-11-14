import jwt from 'jsonwebtoken';

export default function(req, res, next) {
  // Lấy token từ header
  const token = req.header('x-auth-token');

  // Kiểm tra có token không
  if (!token) {
    return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
  }

  try {
    // Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
}