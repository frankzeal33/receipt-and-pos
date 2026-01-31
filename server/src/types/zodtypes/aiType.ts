import { z } from "zod";
import { invoiceEmailReminderSchema, parsedInvoiceFromTextSchema } from "../../validations/Ai.ts";

export type parsedInvoiceFromTextInput = z.infer<typeof parsedInvoiceFromTextSchema>;
export type invoiceEmailReminderInput = z.infer<typeof invoiceEmailReminderSchema>;