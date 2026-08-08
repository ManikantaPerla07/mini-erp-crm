import { z } from "zod";

export const createStockMovementSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),

  movementType: z.enum(["IN", "OUT"]),

  quantity: z
    .number()
    .int()
    .positive("Quantity must be greater than 0"),

  reason: z
    .string()
    .min(3, "Reason must be at least 3 characters"),
});