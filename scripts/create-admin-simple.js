import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== TẠO USER ADMIN ===\n');

  try {
    const employeeCode = 'ADMIN';
    const password = 'admin';
    const name = 'Administrator';
    const email = 'admin@anminh.com';
    const phone = '0900000000';

    console.log('Đang tạo/cập nhật user ADMIN...');

    const hashedPassword = await bcrypt.hash(password, 10);

    // Tìm hoặc tạo user
    const existing = await prisma.user.findUnique({
      where: { employeeCode },
    });

    let user;
    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          email,
          phone,
          role: 'ADMIN',
          password: hashedPassword,
          isActive: true,
        },
      });
      console.log('✅ Đã cập nhật user ADMIN');
    } else {
      user = await prisma.user.create({
        data: {
          name,
          employeeCode,
          email,
          phone,
          role: 'ADMIN',
          password: hashedPassword,
          isActive: true,
        },
      });
      console.log('✅ Đã tạo user ADMIN mới');
    }

    console.log('\n📝 THÔNG TIN ĐĂNG NHẬP:');
    console.log(`   Employee Code: ${user.employeeCode}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive ? 'YES' : 'NO'}`);
    console.log('\n✅ Hoàn tất!\n');

  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    if (error.message.includes('Can\'t reach database server')) {
      console.error('\n💡 PostgreSQL không chạy!');
      console.error('   Giải pháp:');
      console.error('   1. Mở Services: services.msc');
      console.error('   2. Tìm service "postgresql"');
      console.error('   3. Start nếu đang stopped');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

