import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Users
  await prisma.user.upsert({
    where: { email: "admin@ims.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@ims.com",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });
  await prisma.user.upsert({
    where: { email: "manager@ims.com" },
    update: {},
    create: {
      name: "Store Manager",
      email: "manager@ims.com",
      password: await bcrypt.hash("manager123", 10),
      role: "MANAGER",
    },
  });
  await prisma.user.upsert({
    where: { email: "viewer@ims.com" },
    update: {},
    create: {
      name: "Viewer Only",
      email: "viewer@ims.com",
      password: await bcrypt.hash("viewer123", 10),
      role: "VIEWER",
    },
  });

  // Categories
  const categories = ["Electronics", "Furniture", "Stationery", "Clothing"];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Vendors
  const v1 = await prisma.vendor.create({
    data: { name: "TechSupply Co.", email: "tech@supply.com", phone: "+91 98765 43210", address: "Mumbai, MH" },
  });
  const v2 = await prisma.vendor.create({
    data: { name: "OfficeWorld", email: "office@world.com", phone: "+91 87654 32109", address: "Bangalore, KA" },
  });

  const elec = await prisma.category.findUnique({ where: { name: "Electronics" } });
  const stat = await prisma.category.findUnique({ where: { name: "Stationery" } });

  // Products
  await prisma.product.createMany({
    data: [
      { name: "Wireless Mouse",      sku: "ELEC-001", quantity: 45, threshold: 10, categoryId: elec!.id, vendorId: v1.id },
      { name: "Mechanical Keyboard", sku: "ELEC-002", quantity: 8,  threshold: 10, categoryId: elec!.id, vendorId: v1.id },
      { name: "A4 Paper Ream",       sku: "STAT-001", quantity: 120,threshold: 20, categoryId: stat!.id, vendorId: v2.id },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed complete");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
