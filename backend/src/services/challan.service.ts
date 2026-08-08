import prisma from "../config/prisma";

interface ChallanItemInput {
  productId: string;
  quantity: number;
}

interface CreateChallanInput {
  customerId: string;
  createdById: string;
  status: "DRAFT" | "CONFIRMED" | "CANCELLED";
  items: ChallanItemInput[];
}

export async function createChallan(data: CreateChallanInput) {
  return prisma.$transaction(async (tx) => {

    const customer = await tx.customer.findUnique({
      where: {
        id: data.customerId,
      },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    let totalQuantity = 0;
    let totalAmount = 0;

    const challanItems = [];

    for (const item of data.items) {

      const product = await tx.product.findUnique({
        where: {
          id: item.productId,
        },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.currentStock < item.quantity) {
        throw new Error(
          `${product.name} has insufficient stock`
        );
      }

      totalQuantity += item.quantity;
      totalAmount += product.unitPrice * item.quantity;

      challanItems.push({
        productId: product.id,
        quantity: item.quantity,
        productName: product.name,
        sku: product.sku,
        unitPrice: product.unitPrice,
      });
    }

    const challan = await tx.challan.create({
      data: {
        challanNumber: `CH-${Date.now()}`,
        customerId: data.customerId,
        createdById: data.createdById,
        status: data.status,
        totalQuantity,
        totalAmount,
      },
    });

    for (const item of challanItems) {

      await tx.challanItem.create({
        data: {
          challanId: challan.id,
          ...item,
        },
      });

      await tx.product.update({
        where: {
          id: item.productId,
        },
        data: {
          currentStock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return tx.challan.findUnique({
      where: {
        id: challan.id,
      },
      include: {
        customer: true,
        items: true,
        createdBy: true,
      },
    });

  });
}
export async function getAllChallans() {
  return prisma.challan.findMany({
    include: {
      customer: true,
      createdBy: true,
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getChallanById(id: string) {
  return prisma.challan.findUnique({
    where: {
      id,
    },
    include: {
      customer: true,
      createdBy: true,
      items: true,
    },
  });
}

export async function deleteChallan(id: string) {
  return prisma.challan.delete({
    where: {
      id,
    },
  });
}