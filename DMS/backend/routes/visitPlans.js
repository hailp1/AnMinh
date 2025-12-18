import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Lấy danh sách kế hoạch viếng thăm
router.get('/', async (req, res) => {
  try {
    const { userId, pharmacyId, visitDate, status } = req.query;
    const where = {};

    if (userId) where.userId = userId;
    if (pharmacyId) where.pharmacyId = pharmacyId;
    if (visitDate) {
      const date = new Date(visitDate);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      where.visitDate = {
        gte: startOfDay,
        lte: endOfDay
      };
    }
    if (status) where.status = status;

    const visitPlans = await prisma.visitPlan.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, employeeCode: true }
        },
        pharmacy: true,
        territory: {
          include: {
            region: true,
            businessUnit: true
          }
        }
      },
      orderBy: [
        { visitDate: 'asc' },
        { visitTime: 'asc' }
      ]
    });
    res.json(visitPlans);
  } catch (error) {
    console.error('Error fetching visit plans:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy kế hoạch viếng thăm theo ngày cho TDV
router.get('/daily/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    const visitDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(visitDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(visitDate.setHours(23, 59, 59, 999));

    const visitPlans = await prisma.visitPlan.findMany({
      where: {
        userId,
        visitDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          not: 'CANCELLED'
        }
      },
      include: {
        pharmacy: true,
        territory: true
      },
      orderBy: [
        { visitTime: 'asc' }
      ]
    });

    // Lấy danh sách khách hàng đã được phân bổ nhưng chưa có kế hoạch viếng thăm
    const assignments = await prisma.customerAssignment.findMany({
      where: {
        userId,
        isActive: true
      },
      include: {
        pharmacy: true,
        territory: true
      }
    });

    const assignedPharmacyIds = visitPlans.map(vp => vp.pharmacyId);
    const unplannedCustomers = assignments
      .filter(a => !assignedPharmacyIds.includes(a.pharmacyId))
      .map(a => ({
        ...a.pharmacy,
        assignment: a,
        isPlanned: false
      }));

    res.json({
      visitPlans,
      unplannedCustomers,
      date: visitDate.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error fetching daily visit plans:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Tạo kế hoạch viếng thăm
router.post('/', async (req, res) => {
  try {
    const { userId, pharmacyId, territoryId, visitDate, visitTime, purpose, notes } = req.body;

    const visitPlan = await prisma.visitPlan.create({
      data: {
        userId,
        pharmacyId,
        territoryId,
        visitDate: new Date(visitDate),
        visitTime,
        purpose,
        notes,
        status: 'PLANNED'
      },
      include: {
        user: {
          select: { id: true, name: true, employeeCode: true }
        },
        pharmacy: true,
        territory: true
      }
    });
    res.json(visitPlan);
  } catch (error) {
    console.error('Error creating visit plan:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Tạo nhiều kế hoạch viếng thăm cùng lúc
router.post('/bulk', async (req, res) => {
  try {
    const { plans } = req.body; // Array of { userId, pharmacyId, visitDate, visitTime, purpose, notes }

    const created = await prisma.visitPlan.createMany({
      data: plans.map(plan => ({
        ...plan,
        visitDate: new Date(plan.visitDate),
        status: 'PLANNED'
      }))
    });

    res.json({
      message: `Đã tạo ${created.count} kế hoạch viếng thăm`,
      count: created.count
    });
  } catch (error) {
    console.error('Error bulk creating visit plans:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật kế hoạch viếng thăm
router.put('/:id', async (req, res) => {
  try {
    const { visitDate, visitTime, purpose, notes, status } = req.body;
    const updateData = {};

    if (visitDate) updateData.visitDate = new Date(visitDate);
    if (visitTime !== undefined) updateData.visitTime = visitTime;
    if (purpose !== undefined) updateData.purpose = purpose;
    if (notes !== undefined) updateData.notes = notes;
    if (status) {
      updateData.status = status;
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
    }

    const visitPlan = await prisma.visitPlan.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, employeeCode: true }
        },
        pharmacy: true,
        territory: true
      }
    });
    res.json(visitPlan);
  } catch (error) {
    console.error('Error updating visit plan:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa kế hoạch viếng thăm
router.delete('/:id', async (req, res) => {
  try {
    await prisma.visitPlan.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });
    res.json({ message: 'Đã hủy kế hoạch viếng thăm' });
  } catch (error) {
    console.error('Error deleting visit plan:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Helper: Tính tuần của tháng (1-5)
const getWeekOfMonth = (date) => {
  const day = date.getDate();
  return Math.ceil(day / 7);
};

// Helper function to generate plans
const generateVisitPlans = async ({ userId, pharmacyId, daysOfWeek, startDate, endDate, frequency, visitTime }) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  // Reset giờ để tránh lỗi so sánh
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const plans = [];

  // Xóa plan cũ chưa thực hiện trong khoảng thời gian này
  await prisma.visitPlan.deleteMany({
    where: {
      userId,
      pharmacyId,
      visitDate: { gte: start, lte: end },
      status: 'PLANNED'
    }
  });

  // Loop qua từng ngày
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const jsDay = d.getDay(); // 0=CN, 1=T2...
    const schemaDay = jsDay === 0 ? 1 : jsDay + 1; // 1=CN, 2=T2...

    // 1. Check Thứ (Day of Week)
    if (!daysOfWeek.includes(schemaDay)) continue;

    // 2. Check Tần suất (Frequency)
    if (frequency === 'F2-ODD' || frequency === 'F2-EVEN') {
      const weekNum = getWeekOfMonth(d);
      const isOddWeek = weekNum % 2 !== 0; // Tuần 1, 3, 5

      if (frequency === 'F2-ODD' && !isOddWeek) continue; // F2-Lẻ mà gặp tuần Chẵn -> Bỏ
      if (frequency === 'F2-EVEN' && isOddWeek) continue; // F2-Chẵn mà gặp tuần Lẻ -> Bỏ
    }

    // F1 (Tháng 1 lần) - Chỉ chọn tuần đầu tiên của tháng làm mẫu
    if (frequency === 'F1') {
      const weekNum = getWeekOfMonth(d);
      if (weekNum !== 1) continue; // Chỉ đi tuần 1
    }

    plans.push({
      userId,
      pharmacyId,
      visitDate: new Date(d),
      dayOfWeek: schemaDay,
      status: 'PLANNED',
      frequency: frequency || 'F4',
      visitTime: visitTime || '08:00'
    });
  }

  if (plans.length > 0) {
    await prisma.visitPlan.createMany({ data: plans });
  }
  return plans.length;
};

// Sinh lịch tự động theo cấu hình (F và Thứ)
router.post('/generate', async (req, res) => {
  try {
    const { userId, pharmacyIds, daysOfWeek, startDate, endDate, frequency } = req.body;
    let totalCreated = 0;

    // Khởi tạo thời gian bắt đầu là 08:00
    let currentTime = new Date();
    currentTime.setHours(8, 0, 0);

    for (const pharmacyId of pharmacyIds) {
      // Format HH:mm
      const timeString = currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

      const count = await generateVisitPlans({
        userId,
        pharmacyId,
        daysOfWeek,
        startDate,
        endDate,
        frequency,
        visitTime: timeString
      });

      // Tăng 30 phút cho khách tiếp theo
      currentTime.setMinutes(currentTime.getMinutes() + 30);
      totalCreated += count;
    }

    res.json({
      message: `Đã sinh ${totalCreated} lịch viếng thăm thành công`,
      count: totalCreated
    });

  } catch (error) {
    console.error('Error generating visit plans:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Import tuyến từ Excel (JSON data)
router.post('/import-routes', async (req, res) => {
  try {
    const { routes } = req.body; // Array of { employeeCode, customerCode, frequency, days, startDate, endDate }
    let successCount = 0;
    let errors = [];

    for (const route of routes) {
      try {
        // 1. Find User
        const user = await prisma.user.findUnique({ where: { employeeCode: route.employeeCode } });
        if (!user) {
          errors.push(`Không tìm thấy TDV mã ${route.employeeCode}`);
          continue;
        }

        // 2. Find Pharmacy
        // Note: Pharmacy code might not be unique globally in some systems, but assuming unique here or findFirst
        const pharmacy = await prisma.pharmacy.findFirst({ where: { code: route.customerCode } });
        if (!pharmacy) {
          errors.push(`Không tìm thấy KH mã ${route.customerCode}`);
          continue;
        }

        // 3. Parse days (e.g., "2,5" -> [2, 5])
        const daysOfWeek = route.days.toString().split(',').map(d => parseInt(d.trim()));

        // 4. Generate
        const count = await generateVisitPlans({
          userId: user.id,
          pharmacyId: pharmacy.id,
          daysOfWeek,
          startDate: route.startDate, // Format YYYY-MM-DD expected
          endDate: route.endDate,
          frequency: route.frequency
        });
        successCount += count;

      } catch (err) {
        console.error(`Error processing route ${route.customerCode}:`, err);
        errors.push(`Lỗi dòng KH ${route.customerCode}: ${err.message}`);
      }
    }

    res.json({
      message: `Đã xử lý xong. Sinh ${successCount} lịch.`,
      errors: errors.length > 0 ? errors : null,
      successCount
    });

  } catch (error) {
    console.error('Error importing routes:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Check-in (Bắt đầu viếng thăm)
router.post('/check-in', async (req, res) => {
  try {
    const { userId, pharmacyId, latitude, longitude } = req.body;
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // 1. Tìm kế hoạch hôm nay
    let visitPlan = await prisma.visitPlan.findFirst({
      where: {
        userId,
        pharmacyId,
        visitDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { not: 'CANCELLED' }
      }
    });

    const locationNote = `Check-in: ${new Date().toLocaleTimeString()} @ [${latitude}, ${longitude}]`;

    if (visitPlan) {
      // Update existing plan
      visitPlan = await prisma.visitPlan.update({
        where: { id: visitPlan.id },
        data: {
          status: 'IN_PROGRESS',
          notes: visitPlan.notes ? `${visitPlan.notes}\n${locationNote}` : locationNote
        }
      });
    } else {
      // Create ad-hoc plan
      visitPlan = await prisma.visitPlan.create({
        data: {
          userId,
          pharmacyId,
          visitDate: new Date(),
          visitTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          status: 'IN_PROGRESS',
          purpose: 'Viếng thăm phát sinh',
          notes: locationNote
        }
      });
    }

    res.json(visitPlan);
  } catch (error) {
    console.error('Error checking in:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Check-out (Kết thúc viếng thăm)
router.post('/check-out', async (req, res) => {
  try {
    const { visitId, latitude, longitude, notes } = req.body;

    const visitPlan = await prisma.visitPlan.findUnique({ where: { id: visitId } });
    if (!visitPlan) {
      return res.status(404).json({ message: 'Không tìm thấy lượt viếng thăm' });
    }

    const locationNote = `Check-out: ${new Date().toLocaleTimeString()} @ [${latitude}, ${longitude}]`;
    const finalNotes = visitPlan.notes ? `${visitPlan.notes}\n${locationNote}` : locationNote;
    const userNotes = notes ? `\nGhi chú: ${notes}` : '';

    const updatedPlan = await prisma.visitPlan.update({
      where: { id: visitId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        notes: finalNotes + userNotes
      }
    });

    res.json(updatedPlan);
  } catch (error) {
    console.error('Error checking out:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Get current active visit
router.get('/current/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const activeVisit = await prisma.visitPlan.findFirst({
      where: {
        userId,
        status: 'IN_PROGRESS',
        visitDate: { gte: startOfDay }
      }
    });

    res.json(activeVisit);
  } catch (error) {
    console.error('Error fetching active visit:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Route Summary for Manager View
router.get('/route-summary', async (req, res) => {
  try {
    const { userId, date } = req.query;
    if (!userId || !date) {
      return res.status(400).json({ message: 'Missing userId or date' });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const startOfYear = new Date(targetDate.getFullYear(), 0, 1);

    // 1. Get Visit Plans
    const visitPlans = await prisma.visitPlan.findMany({
      where: {
        userId,
        visitDate: { gte: startOfDay, lte: endOfDay },
        status: { not: 'CANCELLED' }
      },
      include: {
        pharmacy: true
      },
      orderBy: { visitTime: 'asc' }
    });

    // 2. Get Orders for the day
    const dailyOrders = await prisma.order.findMany({
      where: {
        userId,
        createdAt: { gte: startOfDay, lte: endOfDay }
      }
    });

    // 3. Enrich with Stats
    const summary = await Promise.all(visitPlans.map(async (visit) => {
      // Find order for this visit
      const order = dailyOrders.find(o => o.pharmacyId === visit.pharmacyId);

      // Calculate MTD Sales
      const mtdSales = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          pharmacyId: visit.pharmacyId,
          createdAt: { gte: startOfMonth },
          status: { not: 'CANCELLED' }
        }
      });

      // Calculate YTD Sales
      const ytdSales = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          pharmacyId: visit.pharmacyId,
          createdAt: { gte: startOfYear },
          status: { not: 'CANCELLED' }
        }
      });

      return {
        ...visit,
        order: order || null,
        stats: {
          mtd: mtdSales._sum.totalAmount || 0,
          ytd: ytdSales._sum.totalAmount || 0
        }
      };
    }));

    res.json(summary);
  } catch (error) {
    console.error('Error fetching route summary:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;
