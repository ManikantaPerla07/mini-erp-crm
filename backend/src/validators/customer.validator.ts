import { z } from "zod";

export const createCustomerSchema = z.object({
  customerName: z
    .string()
    .min(2, "Customer name must be at least 2 characters"),

  mobile: z
    .string()
    .min(10, "Mobile number must be at least 10 digits"),

  email: z
    .string()
    .email("Invalid email address")
    .optional(),

  businessName: z
    .string()
    .min(2, "Business name is required"),

  gstNumber: z
    .string()
    .optional(),

  customerType: z.enum([
    "RETAIL",
    "WHOLESALE",
    "DISTRIBUTOR",
  ]),

  address: z
    .string()
    .min(5, "Address is required"),

  status: z.enum([
    "LEAD",
    "ACTIVE",
    "INACTIVE",
  ]),
});

export const updateCustomerSchema =
  createCustomerSchema.partial();