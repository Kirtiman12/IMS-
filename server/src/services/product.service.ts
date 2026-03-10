import { prisma } from "@/prisma/client";
import type { Prisma } from "@prisma/client";

export const getAllProducts = (
  categoryId?: string,
  search?:     string,
  sortBy?:     string,
) => {
  // Build orderBy
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sortBy === "qty-asc")    orderBy = { quantity: "asc"  };
  if (sortBy === "qty-desc")   orderBy = { quantity: "desc" };
  if (sortBy === "price-asc")  orderBy = { price:    "asc"  };
  if (sortBy === "price-desc") orderBy = { price:    "desc" };

  return prisma.product.findMany({
    where: {
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { sku:  { contains: search } },
        ],
      }),
    },
    include:  { category: true, vendor: true },
    orderBy,
  });
};

export const getProductById = (id: string) =>
  prisma.product.findUnique({
    where:   { id },
    include: {
      category:    true,
      vendor:      true,
      stockEntries: {
        orderBy: { createdAt: "desc" },
        take:    20,
        include: { user: { select: { name: true } } },
      },
    },
  });

export const createProduct = (data: {
  name:         string;
  sku:          string;
  quantity:     number;
  threshold:    number;
  categoryId:   string;
  vendorId?:    string;
  description?: string;
  price?:       number;
  supplierName?: string;
}) => prisma.product.create({ data, include: { category: true, vendor: true } });

export const updateProduct = (
  id:   string,
  data: Partial<{
    name:         string;
    sku:          string;
    quantity:     number;
    threshold:    number;
    categoryId:   string;
    vendorId:     string;
    description:  string;
    price:        number;
    supplierName: string;
  }>,
) => prisma.product.update({ where: { id }, data, include: { category: true, vendor: true } });

export const deleteProduct = (id: string) =>
  prisma.product.delete({ where: { id } });
