import { prisma } from "@/prisma/client";

export const getDashboardStats = async () => {
  const [totalProducts, totalVendors, totalMovements, lowStockItems, recentActivity] =
    await prisma.$transaction([
      prisma.product.count(),
      prisma.vendor.count(),
      prisma.stockEntry.count(),
      prisma.product.findMany({
        where: { quantity: { lte: prisma.product.fields.threshold } },
        include: { category: true },
      }),
      prisma.stockEntry.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { product: { select: { name: true, sku: true } } },
      }),
    ]);

  return { totalProducts, totalVendors, totalMovements, lowStockItems, recentActivity };
};

export const getLowStock = () =>
  prisma.product.findMany({
    where: {
      quantity: { lte: prisma.product.fields.threshold },
    },
    include: { category: true, vendor: true },
  });
