import { z } from "zod";
export const paystackVerifySchema = z.object({
    body: z.object({
        reference: z
            .string()
            .min(1, "reference is required")
    })
});
