import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      name: "System Administrator",
      email: "admin@erp.com",
      password: "Admin@123",
      role: Role.ADMIN,
    },
    {
      name: "Sales User",
      email: "sales@erp.com",
      password: "Sales@123",
      role: Role.SALES,
    },
    {
      name: "Warehouse User",
      email: "warehouse@erp.com",
      password: "Warehouse@123",
      role: Role.WAREHOUSE,
    },
    {
      name: "Accounts User",
      email: "accounts@erp.com",
      password: "Accounts@123",
      role: Role.ACCOUNTS,
    },
  ];

  for (const user of users) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      console.log(`User already exists: ${user.email}`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });

    console.log(`Created: ${user.email} (${user.role})`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });