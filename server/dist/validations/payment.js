import { z } from "zod";
export const paystackVerifySchema = z.object({
    body: z.object({
        reference: z
            .string()
            .min(1, "reference is required")
    })
});
export const paymentHistoryPaginationSchema = z.object({
    query: z.object({
        status: z.enum(["SUCCESSFUL", "FAILED", "PENDING"], {
            message: "Invalid status",
        }).optional(),
        search: z.string().optional(),
        page: z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 1))
            .refine((val) => !isNaN(val) && val > 0, { message: "Page must be a positive number" }),
        limit: z
            .string()
            .optional()
            .transform((val) => {
            const parsed = val ? parseInt(val, 10) : 10;
            return Math.min(parsed, 50); // cap at 50
        })
            .refine((val) => !isNaN(val) && val > 0, { message: "Limit must be a positive number" }),
    })
});
