import prisma from "../config/prisma";
import { MovementType } from "@prisma/client";

interface StockInput {
  productId: string;
  movementType: MovementType;
  quantity: number;
  reason: string;
  createdById: string;
}

export async function createStockMovement(data: StockInput) {
  const product = await prisma.product.findUnique({
    where: {
      id: data.productId,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (
    data.movementType === "OUT" &&
    product.currentStock < data.quantity
  ) {
    throw new Error("Insufficient stock");
  }

  const updatedStock =
    data.movementType === "IN"
      ? product.currentStock + data.quantity
      : product.currentStock - data.quantity;

  await prisma.product.update({
    where: {
      id: product.id,
    },
    data: {
      currentStock: updatedStock,
    },
  });

  return prisma.stockMovement.create({
    data,
  });
}

export async function getStockMovements() {
  return prisma.stockMovement.findMany({
    include: {
      product: true,
      createdBy: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getStockMovementById(id: string) {
  return prisma.stockMovement.findUnique({
    where: {
      id,
    },
    include: {
      product: true,
      createdBy: true,
    },
  });
}