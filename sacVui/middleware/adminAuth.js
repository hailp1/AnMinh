import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export default async function (req, res, next) {
  // Lấy token từ header
  const token = req.header('x-auth-token');

  // Kiểm tra có token không
  if (!token) {
    return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
  }

  try {
    // Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    // Kiểm tra user có phải admin không
    const user = await prisma.user.findUnique({
      where: { id: decoded.user.id }
    });
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
    }

    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
}