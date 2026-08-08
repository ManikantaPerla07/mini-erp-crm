import { z } from "zod";

export const createFollowupSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),

  note: z
    .string()
    .min(3, "Note must be at least 3 characters"),

  followupDate: z.string().datetime(),
});

export const updateFollowupSchema = createFollowupSchema.partial();