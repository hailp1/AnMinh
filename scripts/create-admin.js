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

  // Try find by employeeCode; create or update
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
      select: { id: true, name: true, employeeCode: true, role: true, email: true, phone: true, isActive: true },
    });
    console.log('Updated existing user to ADMIN:', user);
  } else {
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
      select: { id: true, name: true, employeeCode: true, role: true, email: true, phone: true, isActive: true },
    });
    console.log('Created ADMIN user:', user);
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


