import { z } from "zod";
import { paymentHistoryPaginationSchema, paystackVerifySchema } from "../../validations/payment.ts";

export type paystackVerifyInput = z.infer<typeof paystackVerifySchema>;
export type paymentHistoryPaginationInput = z.infer<typeof paymentHistoryPaginationSchema>;