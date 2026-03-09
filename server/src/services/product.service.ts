import { prisma } from "@/prisma/client";

export const getAllProducts = (categoryId?: string, search?: string) =>
  prisma.product.findMany({
    where: {
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { sku:  { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    include: { category: true, vendor: true },
    orderBy: { createdAt: "desc" },
  });

export const getProductById = (id: string) =>
  prisma.product.findUnique({
    where: { id },
    include: { category: true, vendor: true, stockEntries: { orderBy: { createdAt: "desc" }, take: 20 } },
  });

export const createProduct = (data: {
  name: string; sku: string; quantity: number;
  threshold: number; categoryId: string; vendorId?: string;
}) => prisma.product.create({ data, include: { category: true, vendor: true } });

export const updateProduct = (id: string, data: Partial<{
  name: string; sku: string; quantity: number;
  threshold: number; categoryId: string; vendorId: string;
}>) => prisma.product.update({ where: { id }, data, include: { category: true, vendor: true } });

export const deleteProduct = (id: string) =>
  prisma.product.delete({ where: { id } });
