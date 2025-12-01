import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function checkOrCreateAdmin() {
  console.log('\n=== Kiểm tra và tạo User Admin ===\n');

  try {
    // Kiểm tra user với employeeCode = 'admin'
    let admin = await prisma.user.findUnique({
      where: { employeeCode: 'ADMIN' }
    });

    if (admin) {
      console.log('✅ User ADMIN đã tồn tại:');
      console.log(`   Employee Code: ${admin.employeeCode}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email || 'N/A'}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Active: ${admin.isActive ? 'YES' : 'NO'}`);
      console.log('\n💡 Để login:');
      console.log(`   Employee Code: ${admin.employeeCode}`);
      console.log('   Password: (cần kiểm tra password hiện tại)');
      
      // Kiểm tra password
      const testPassword = await bcrypt.compare('admin', admin.password);
      if (testPassword) {
        console.log('   ✅ Password hiện tại: admin');
      } else {
        const testPassword123 = await bcrypt.compare('admin123', admin.password);
        if (testPassword123) {
          console.log('   ✅ Password hiện tại: admin123');
        } else {
          console.log('   ⚠️  Password không phải "admin" hoặc "admin123"');
          console.log('   → Cần reset password');
        }
      }
    } else {
      console.log('❌ User ADMIN chưa tồn tại');
      console.log('   → Đang tạo user ADMIN...\n');
      
      const hashedPassword = await bcrypt.hash('admin', 10);
      
      admin = await prisma.user.create({
        data: {
          name: 'Administrator',
          employeeCode: 'ADMIN',
          email: 'admin@anminh.com',
          phone: '0900000000',
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
        },
      });
      
      console.log('✅ Đã tạo user ADMIN thành công!');
      console.log('\n📝 Thông tin đăng nhập:');
      console.log(`   Employee Code: ${admin.employeeCode}`);
      console.log(`   Password: admin`);
      console.log(`   Role: ${admin.role}`);
    }

    // Kiểm tra các user khác
    console.log('\n=== Danh sách tất cả users ===\n');
    const allUsers = await prisma.user.findMany({
      select: {
        employeeCode: true,
        name: true,
        role: true,
        isActive: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    console.log(`Tổng số users: ${allUsers.length}\n`);
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.employeeCode} - ${user.name} (${user.role}) - ${user.isActive ? 'Active' : 'Inactive'}`);
    });

    console.log('\n✅ Hoàn tất!\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    if (error.message.includes('Can\'t reach database server')) {
      console.error('\n💡 PostgreSQL không chạy!');
      console.error('   → Start PostgreSQL service: services.msc');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrCreateAdmin();

