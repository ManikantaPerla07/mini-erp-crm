import prisma from "../config/prisma";

export async function getDashboardStats() {
  const [
    totalCustomers,
    totalProducts,
    totalChallans,
    lowStockProducts,
    upcomingFollowups,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.product.count(),
    prisma.challan.count(),
    prisma.product.count({
      where: {
        currentStock: {
          lte: prisma.product.fields.minimumStock,
        },
      },
    }),
    prisma.customerFollowUp.count({
      where: {
        followupDate: {
          gte: new Date(),
        },
      },
    }),
  ]);

  const inventory = await prisma.product.findMany({
    select: {
      currentStock: true,
      unitPrice: true,
    },
  });

  const inventoryValue = inventory.reduce(
    (sum, item) => sum + item.currentStock * item.unitPrice,
    0
  );

  return {
    totalCustomers,
    totalProducts,
    totalChallans,
    lowStockProducts,
    upcomingFollowups,
    inventoryValue,
  };
}