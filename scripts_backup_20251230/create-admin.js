import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Args: [node, script, employeeCode, password, name, email, phone]
  const [, , argEmployeeCode, argPassword, argName, argEmail, argPhone] = process.argv;

  const employeeCode = (argEmployeeCode || 'HAILP').toUpperCase();
  const password = argPassword || 'Admin@12345';
  const name = argName || 'System Administrator';
  const email = argEmail || 'admin@anminh.com';
  const phone = argPhone || '0900000000';

  console.log(`Upserting ADMIN user:
  - employeeCode: ${employeeCode}
  - name        : ${name}
  - email       : ${email}
  - phone       : ${phone}`);

  const hashedPassword = await bcrypt.hash(password, 10);

  // Try find by employeeCode
  let user = await prisma.user.findUnique({
    where: { employeeCode },
  });

  if (user) {
    // Update existing user by employeeCode
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        email, // This might fail if email is taken by ANOTHER user
        phone,
        role: 'ADMIN',
        password: hashedPassword,
        isActive: true,
      },
    });
    console.log('Updated existing user (by code) to ADMIN:', user);
  } else {
    // Check if email exists
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      // Update existing user by email
      user = await prisma.user.update({
        where: { id: existingEmail.id },
        data: {
          employeeCode, // Update code to HAILP
          name,
          phone,
          role: 'ADMIN',
          password: hashedPassword,
          isActive: true,
        },
      });
      console.log('Updated existing user (by email) to ADMIN:', user);
    } else {
      // Create new
      user = await prisma.user.create({
        data: {
          name,
          employeeCode,
          routeCode: null,
          email,
          phone,
          role: 'ADMIN',
          password: hashedPassword,
          isActive: true,
        },
      });
      console.log('Created ADMIN user:', user);
    }
  }

  console.log('\nLogin info:');
  console.log(`- employeeCode: ${employeeCode}`);
  console.log(`- password    : ${password}`);
}

main()
  .catch((e) => {
    console.error('Failed to create admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


