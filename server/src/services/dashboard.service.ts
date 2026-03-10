import { prisma } from "@/prisma/client";

export const getDashboardStats = async () => {
  const [totalProducts, totalVendors, totalMovements, recentActivity] =
    await prisma.$transaction([
      prisma.product.count(),
      prisma.vendor.count(),
      prisma.stockEntry.count(),
      prisma.stockEntry.findMany({
        take:    10,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { name: true, sku: true } },
          user:    { select: { name: true } },
        },
      }),
    ]);

  // Total stock quantity across all products
  const stockAgg = await prisma.product.aggregate({
    _sum: { quantity: true },
  });
  const totalStockQuantity = stockAgg._sum.quantity ?? 0;

  // Low stock — raw SQL since Prisma doesn't support column-to-column comparison
  const lowStockItems = await prisma.$queryRaw<
    { id: string; name: string; sku: string; quantity: number; threshold: number }[]
  >`
    SELECT id, name, sku, quantity, threshold
    FROM Product
    WHERE quantity <= threshold
  `;

  return {
    totalProducts,
    totalVendors,
    totalMovements,
    totalStockQuantity,
    lowStockItems,
    recentActivity,
  };
};

export const getLowStock = async () =>
  prisma.$queryRaw<
    { id: string; name: string; sku: string; quantity: number; threshold: number }[]
  >`
    SELECT p.id, p.name, p.sku, p.quantity, p.threshold, c.name as categoryName
    FROM Product p
    JOIN Category c ON p.categoryId = c.id
    WHERE p.quantity <= p.threshold
  `;
