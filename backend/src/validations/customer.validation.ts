import { z } from "zod";

export const createCustomerSchema = z.object({
  customerName: z.string().min(3),

  mobile: z.string().min(10),

  email: z.string().email().optional(),

  businessName: z.string().min(2),

  gstNumber: z.string().optional(),

  customerType: z.enum([
    "RETAIL",
    "WHOLESALE",
    "DISTRIBUTOR",
  ]),

  address: z.string().min(5),

  status: z.enum([
    "LEAD",
    "ACTIVE",
    "INACTIVE",
  ]),
});

export const updateCustomerSchema =
  createCustomerSchema.partial();