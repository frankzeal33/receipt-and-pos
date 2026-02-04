import { z } from "zod";
import { paystackVerifySchema } from "../../validations/payment.ts";

export type paystackVerifyInput = z.infer<typeof paystackVerifySchema>;