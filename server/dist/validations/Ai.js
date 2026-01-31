import { z } from "zod";
export const parsedInvoiceFromTextSchema = z.object({
    body: z.object({
        text: z.string().min(1, "Text is required"),
    })
});
export const invoiceEmailReminderSchema = z.object({
    params: z.object({
        invoiceId: z.string().min(1, "InvoiceID is required"),
    })
});
