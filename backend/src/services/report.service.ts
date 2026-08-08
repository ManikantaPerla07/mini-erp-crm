import prisma from "../config/prisma";

export async function inventoryReport() {
  return prisma.product.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      sku: true,
      category: true,
      currentStock: true,
      minimumStock: true,
      unitPrice: true,
      warehouseLocation: true,
    },
  });
}

export async function customerReport() {
  return prisma.customer.findMany({
    include: {
      challans: true,
      followUps: {
        orderBy: {
          followupDate: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      customerName: "asc",
    },
  });
}

export async function challanReport() {
  return prisma.challan.findMany({
    include: {
      customer: true,
      createdBy: {
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
  },
},
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}