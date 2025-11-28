import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function verifyUser(employeeCode, password) {
  try {
    const user = await prisma.user.findUnique({
      where: { employeeCode: employeeCode.toUpperCase() }
    });
    
    if (!user) {
      return { exists: false };
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    return {
      exists: true,
      passwordMatch,
      user: {
        employeeCode: user.employeeCode,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      }
    };
  } catch (error) {
    throw error;
  }
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║     KIỂM TRA TÀI KHOẢN                                    ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  try {
    // Kiểm tra ADMIN
    console.log('1. Kiểm tra user ADMIN...');
    const admin = await verifyUser('admin', 'admin');
    if (admin.exists) {
      console.log('   ✅ User ADMIN tồn tại');
      console.log(`   Name: ${admin.user.name}`);
      console.log(`   Role: ${admin.user.role}`);
      console.log(`   Active: ${admin.user.isActive ? 'YES' : 'NO'}`);
      console.log(`   Password match: ${admin.passwordMatch ? '✅ YES' : '❌ NO'}`);
    } else {
      console.log('   ❌ User ADMIN không tồn tại');
    }
    console.log('');

    // Kiểm tra AM01
    console.log('2. Kiểm tra user AM01...');
    const am01 = await verifyUser('AM01', 'Anminh@123');
    if (am01.exists) {
      console.log('   ✅ User AM01 tồn tại');
      console.log(`   Name: ${am01.user.name}`);
      console.log(`   Role: ${am01.user.role}`);
      console.log(`   Active: ${am01.user.isActive ? 'YES' : 'NO'}`);
      console.log(`   Password match: ${am01.passwordMatch ? '✅ YES' : '❌ NO'}`);
    } else {
      console.log('   ❌ User AM01 không tồn tại');
    }
    console.log('');

    console.log('✅ Hoàn tất!\n');

  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    if (error.message.includes("Can't reach database server")) {
      console.error('\n💡 PostgreSQL không chạy!');
      console.error('   → Start PostgreSQL service: services.msc');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

