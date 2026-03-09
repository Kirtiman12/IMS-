import { prisma } from "@/prisma/client";

export const getAllVendors = () =>
  prisma.vendor.findMany({
    include: { _count: { select: { purchases: true, products: true } } },
    orderBy: { createdAt: "desc" },
  });

export const createVendor = (data: {
  name: string; email?: string; phone?: string; address?: string;
}) => prisma.vendor.create({ data });

export const getVendorPurchases = (vendorId: string) =>
  prisma.purchaseEntry.findMany({
    where: { vendorId },
    orderBy: { createdAt: "desc" },
  });

export const createPurchaseEntry = (data: {
  vendorId: string; amount: number; note?: string;
}) => prisma.purchaseEntry.create({ data });
