import prisma from "../config/prisma";

export async function createFollowup(data: {
  note: string;
  followupDate: string;
  customerId: string;
  createdById: string;
}) {
  return prisma.customerFollowUp.create({
    data: {
      ...data,
      followupDate: new Date(data.followupDate),
    },
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
    },
  });
}

export async function getAllFollowups() {
  return prisma.customerFollowUp.findMany({
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
    },
    orderBy: {
      followupDate: "asc",
    },
  });
}

export async function getFollowupById(id: string) {
  return prisma.customerFollowUp.findUnique({
    where: { id },
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
    },
  });
}

export async function updateFollowup(
  id: string,
  data: {
    note?: string;
    followupDate?: string;
  }
) {
  return prisma.customerFollowUp.update({
    where: { id },
    data: {
      ...(data.note && { note: data.note }),
      ...(data.followupDate && {
        followupDate: new Date(data.followupDate),
      }),
    },
  });
}

export async function deleteFollowup(id: string) {
  return prisma.customerFollowUp.delete({
    where: { id },
  });
}