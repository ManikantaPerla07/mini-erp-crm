import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters"),

  sku: z
    .string()
    .min(2, "SKU is required"),

  category: z
    .string()
    .min(2, "Category is required"),

  price: z
    .number()
    .positive("Price must be greater than 0"),

  stock: z
    .number()
    .int()
    .min(0, "Stock cannot be negative")
});

export const updateProductSchema = createProductSchema.partial();