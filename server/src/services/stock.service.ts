import { prisma } from "@/prisma/client";
import type { StockType } from "@prisma/client";

export const getStockHistory = (productId?: string) =>
  prisma.stockEntry.findMany({
    where:   { ...(productId && { productId }) },
    include: {
      product: { select: { name: true, sku: true } },
      user:    { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

export const createStockEntry = async (data: {
  productId: string;
  type:      StockType;
  quantity:  number;
  note?:     string;
  userId:    string;       // ← new
}) => {
  const delta = data.type === "STOCK_IN" ? data.quantity : -data.quantity;

  const [entry] = await prisma.$transaction([
    prisma.stockEntry.create({
      data,
      include: {
        product: { select: { name: true, sku: true } },
        user:    { select: { name: true } },
      },
    }),
    prisma.product.update({
      where: { id: data.productId },
      data:  { quantity: { increment: delta } },
    }),
  ]);

  return entry;
};
