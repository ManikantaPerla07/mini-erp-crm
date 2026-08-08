import { z } from "zod";

export const createChallanSchema = z.object({
  customerId: z.string(),

  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),

  status: z.enum(["DRAFT", "CONFIRMED", "CANCELLED"]).default("DRAFT"),
});