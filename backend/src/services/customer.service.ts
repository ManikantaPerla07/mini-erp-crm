import prisma from "../config/prisma";

export async function createCustomer(data: {
  customerName: string;
  mobile: string;
  email?: string;
  businessName: string;
  gstNumber?: string;
  customerType: "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
  address: string;
  status: "LEAD" | "ACTIVE" | "INACTIVE";
}) {
  return await prisma.customer.create({
    data,
  });
}

export async function getCustomers() {
  return await prisma.customer.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCustomerById(id: string) {
  return await prisma.customer.findUnique({
    where: { id },
  });
}

export async function updateCustomer(
  id: string,
  data: Partial<{
  customerName: string;
  mobile: string;
  email?: string;
  businessName: string;
  gstNumber?: string;
  customerType: "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
  address: string;
  status: "LEAD" | "ACTIVE" | "INACTIVE";
}>
) {
  return await prisma.customer.update({
    where: { id },
    data,
  });
}

export async function deleteCustomer(id: string) {
  return await prisma.customer.delete({
    where: { id },
  });
}