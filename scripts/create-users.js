import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function createUser(employeeCode, password, name, email, phone, role) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Kiểm tra user đã tồn tại chưa
    const existing = await prisma.user.findUnique({
      where: { employeeCode: employeeCode.toUpperCase() }
    });
    
    let user;
    if (existing) {
      // Update existing user
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          email,
          phone,
          role: role.toUpperCase(),
          password: hashedPassword,
          isActive: true,
        },
      });
      return { created: false, user };
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          name,
          employeeCode: employeeCode.toUpperCase(),
          email,
          phone,
          role: role.toUpperCase(),
          password: hashedPassword,
          isActive: true,
        },
      });
      return { created: true, user };
    }
  } catch (error) {
    throw error;
  }
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║     TẠO TÀI KHOẢN NGƯỜI DÙNG                              ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Tạo user ADMIN
    console.log('1. Tạo user ADMIN...');
    const adminResult = await createUser(
      'admin',
      'admin',
      'Administrator',
      'admin@anminh.com',
      '0900000000',
      'ADMIN'
    );
    
    if (adminResult.created) {
      console.log('   ✅ Đã tạo user ADMIN mới');
    } else {
      console.log('   ✅ Đã cập nhật user ADMIN (đã tồn tại)');
    }
    console.log(`   Employee Code: ${adminResult.user.employeeCode}`);
    console.log(`   Password: admin`);
    console.log(`   Role: ${adminResult.user.role}`);
    console.log('');

    // 2. Tạo user AM01 (TDV)
    console.log('2. Tạo user AM01 (Trình dược viên)...');
    const am01Result = await createUser(
      'AM01',
      'Anminh@123',
      'Nhân viên AM01',
      'am01@anminh.com',
      '0900000001',
      'TDV'
    );
    
    if (am01Result.created) {
      console.log('   ✅ Đã tạo user AM01 mới');
    } else {
      console.log('   ✅ Đã cập nhật user AM01 (đã tồn tại)');
    }
    console.log(`   Employee Code: ${am01Result.user.employeeCode}`);
    console.log(`   Password: Anminh@123`);
    console.log(`   Role: ${am01Result.user.role}`);
    console.log('');

    // Hiển thị tóm tắt
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║     ✅ ĐÃ TẠO XONG!                                       ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    console.log('📝 THÔNG TIN ĐĂNG NHẬP:\n');
    
    console.log('1. Tài khoản ADMIN:');
    console.log('   Employee Code: admin');
    console.log('   Password: admin');
    console.log('   Role: ADMIN');
    console.log('');
    
    console.log('2. Tài khoản TDV:');
    console.log('   Employee Code: AM01');
    console.log('   Password: Anminh@123');
    console.log('   Role: TDV (Trình dược viên)');
    console.log('');
    
    console.log('🌐 Đăng nhập tại: http://localhost:3099\n');

  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    if (error.message.includes("Can't reach database server")) {
      console.error('\n💡 PostgreSQL không chạy!');
      console.error('   → Start PostgreSQL service: services.msc');
      console.error('   → Tìm service "postgresql" và Start nếu stopped');
    } else if (error.code === 'P2002') {
      console.error('   → Employee code đã tồn tại (đã được cập nhật)');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

