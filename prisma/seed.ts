import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Hash password
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Create Master user
  const master = await prisma.user.upsert({
    where: { email: "master@flowspace.com" },
    update: {},
    create: {
      email: "master@flowspace.com",
      password: hashedPassword,
      name: "Master Admin",
      role: "master",
      status: "active",
    },
  });

  console.log("✓ Master user created:", master.email);

  // Create Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@flowspace.com" },
    update: {},
    create: {
      email: "admin@flowspace.com",
      password: hashedPassword,
      name: "Admin User",
      role: "admin",
      status: "active",
    },
  });

  console.log("✓ Admin user created:", admin.email);

  // Create a sample division
  const division = await prisma.division.upsert({
    where: { name: "Engineering" },
    update: {},
    create: {
      name: "Engineering",
    },
  });

  console.log("✓ Division created:", division.name);

  // Create a regular user in Engineering division
  const user = await prisma.user.upsert({
    where: { email: "user@flowspace.com" },
    update: {},
    create: {
      email: "user@flowspace.com",
      password: hashedPassword,
      name: "Regular User",
      role: "user",
      status: "active",
      divisionId: division.id,
    },
  });

  console.log("✓ Regular user created:", user.email);

  console.log("\n✅ Seeding completed successfully!");
  console.log("\nDefault credentials:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Master: master@flowspace.com / admin123");
  console.log("Admin:  admin@flowspace.com / admin123");
  console.log("User:   user@flowspace.com / admin123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
