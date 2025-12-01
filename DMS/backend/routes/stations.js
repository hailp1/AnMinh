import express from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Cấu hình multer cho upload ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Lấy danh sách trạm sạc gần nhất
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radiusKm = parseInt(radius) / 1000;

    // Tính toán khoảng cách bằng Haversine formula trong SQL
    const stations = await prisma.$queryRaw`
      SELECT s.*, u.name as owner_name, u.phone as owner_phone,
        (6371 * acos(cos(radians(${userLat})) * cos(radians(latitude)) 
        * cos(radians(longitude) - radians(${userLng})) 
        + sin(radians(${userLat})) * sin(radians(latitude)))) AS distance
      FROM charging_stations s
      JOIN users u ON s."ownerId" = u.id
      WHERE s.status = 'ACTIVE'
      HAVING distance < ${radiusKm}
      ORDER BY distance
    `;

    res.json(stations);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Lỗi server');
  }
});

// Tạo trạm sạc mới
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const {
      name,
      address,
      lat,
      lng,
      chargerTypes,
      pricing,
      amenities,
      operatingHours
    } = req.body;

    const images = req.files ? req.files.map(file => file.filename) : [];

    const station = await prisma.chargingStation.create({
      data: {
        name,
        address,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        ownerId: req.user.id,
        chargerTypes: JSON.parse(chargerTypes || '[]'),
        pricing: JSON.parse(pricing || '[]'),
        amenities: JSON.parse(amenities || '[]'),
        operatingHours: JSON.parse(operatingHours || '{}'),
        images
      }
    });

    // Thưởng điểm cho user tạo trạm
    if (req.user.role === 'USER') {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { points: { increment: 100 } }
      });
    }

    res.json(station);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Lỗi server');
  }
});

// Lấy chi tiết trạm sạc
router.get('/:id', async (req, res) => {
  try {
    const station = await prisma.chargingStation.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: { name: true, phone: true }
        }
      }
    });
    
    if (!station) {
      return res.status(404).json({ message: 'Không tìm thấy trạm sạc' });
    }

    const reviews = await prisma.review.findMany({
      where: { stationId: req.params.id },
      include: {
        user: {
          select: { name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ station, reviews });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Lỗi server');
  }
});

// Đánh giá trạm sạc
router.post('/:id/review', auth, upload.array('images', 3), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const images = req.files ? req.files.map(file => file.filename) : [];

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        stationId: req.params.id,
        rating: parseInt(rating),
        comment,
        images
      }
    });

    // Cập nhật rating trung bình của trạm
    const reviews = await prisma.review.findMany({
      where: { stationId: req.params.id }
    });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.chargingStation.update({
      where: { id: req.params.id },
      data: {
        rating: avgRating,
        totalRatings: reviews.length
      }
    });

    // Thưởng điểm cho user đánh giá
    await prisma.user.update({
      where: { id: req.user.id },
      data: { points: { increment: 10 } }
    });

    res.json(review);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Lỗi server');
  }
});

export default router;