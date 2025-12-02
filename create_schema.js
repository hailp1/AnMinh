const fs = require('fs');

const schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Pharmacy {
  id        String   @id @default(uuid())
  name      String
  address   String?
  phone     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;

fs.writeFileSync('DMS/backend/prisma/schema.prisma', schema, 'utf8');
console.log('Schema created successfully');
