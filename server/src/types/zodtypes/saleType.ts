import { z } from "zod";
import { addCustomerSchema, correctSaleSchema, deleteCustomerSchema, editCustomerSchema, getSaleByIdSchema, makeSaleSchema } from "../../validations/Sale.ts";

export type makeSaleInput = z.infer<typeof makeSaleSchema>;
export type saleByIdInput = z.infer<typeof getSaleByIdSchema>;
export type correctSaleInput = z.infer<typeof correctSaleSchema>;
export type addCustomerInput = z.infer<typeof addCustomerSchema>;
export type editCustomerInput = z.infer<typeof editCustomerSchema>;
export type deleteCustomerInput = z.infer<typeof deleteCustomerSchema>;