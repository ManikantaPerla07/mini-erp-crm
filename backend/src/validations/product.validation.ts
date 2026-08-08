import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Product name is required"),

  sku: z.string().min(2, "SKU is required"),

  category: z.string().min(2, "Category is required"),

  unitPrice: z.number().positive("Unit price must be greater than 0"),

  currentStock: z.number().int().min(0),

  minimumStock: z.number().int().min(0),

  warehouseLocation: z.string().min(2, "Warehouse location is required"),
});

export const updateProductSchema =
  createProductSchema.partial();