import prisma from "../config/prisma";

interface CreateProductInput {
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouseLocation: string;
}

export async function createProduct(data: CreateProductInput) {
  return prisma.product.create({
    data,
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
    data,
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({
    where: {
      id,
    },
  });
}