import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function checkUserAM01() {
  console.log('\n=== Kiểm tra User AM01 trong Database ===\n');
  
  try {
    // Tìm user với employeeCode = 'AM01'
    const user = await prisma.user.findUnique({
      where: { employeeCode: 'AM01' }
    });
    
    if (!user) {
      console.log('❌ User AM01 KHÔNG TỒN TẠI trong database\n');
      console.log('💡 Chạy lệnh sau để tạo user:');
      console.log('   npm run create:am01\n');
      await prisma.$disconnect();
      process.exit(1);
    }
    
    console.log('✅ User AM01 TỒN TẠI:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Name: ${user.name}`);
    console.log(`   - Employee Code: ${user.employeeCode}`);
    console.log(`   - Email: ${user.email || 'N/A'}`);
    console.log(`   - Phone: ${user.phone || 'N/A'}`);
    console.log(`   - Role: ${user.role}`);
    console.log(`   - Is Active: ${user.isActive}`);
    console.log(`   - Password Hash: ${user.password.substring(0, 30)}...`);
    console.log(`   - Created: ${user.createdAt}\n`);
    
    // Test password
    const testPassword = 'admin123';
    const isMatch = await bcrypt.compare(testPassword, user.password);
    
    if (isMatch) {
      console.log('✅ Password "admin123" KHỚP với hash trong database\n');
    } else {
      console.log('❌ Password "admin123" KHÔNG KHỚP với hash trong database\n');
      console.log('💡 Cập nhật password:');
      console.log('   npm run create:am01\n');
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra database:', error.message);
    console.error(error.stack);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkUserAM01();

