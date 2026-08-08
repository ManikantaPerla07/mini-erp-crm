import prisma from "../config/prisma";

interface CreateProductInput {
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
}

export async function createProduct(data: CreateProductInput) {
  return prisma.product.create({
    data: {
      name: data.name,
      sku: data.sku,
      category: data.category,
      unitPrice: data.price,
      currentStock: data.stock,
      minimumStock: 5,
      warehouseLocation: "Main Warehouse",
    },
  });
}

export async function getProducts() {
  return prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: {
      id,
    },
  });
}

export async function updateProduct(
  id: string,
  data: Partial<CreateProductInput>
) {
  return prisma.product.update({
    where: {
      id,
    },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.sku && { sku: data.sku }),
      ...(data.category && { category: data.category }),
      ...(data.price !== undefined && { unitPrice: data.price }),
      ...(data.stock !== undefined && { currentStock: data.stock }),
    },
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({
    where: {
      id,
    },
  });
}