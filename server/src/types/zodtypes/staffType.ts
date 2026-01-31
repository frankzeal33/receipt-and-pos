import { z } from "zod";
import { addExpenseSchema, addInvoiceSchema, addProductSchema, addStaffSchema, deleteExpenseSchema, deleteInvoiceSchema, deleteStaffSchema, editExpenseSchema, editInvoiceSchema, editProductSchema, editStaffSchema, getInvoiceByIdSchema, paginationcategorySchema, paginationSchema, productIdSchema } from "../../validations/Staff.ts";

export type addStaffInput = z.infer<typeof addStaffSchema>;
export type editStaffInput = z.infer<typeof editStaffSchema>;
export type deleteStaffInput = z.infer<typeof deleteStaffSchema>;
export type addProductInput = z.infer<typeof addProductSchema>;
export type editProductInput = z.infer<typeof editProductSchema>;
export type productIdInput = z.infer<typeof productIdSchema>;
export type addExpenseInput = z.infer<typeof addExpenseSchema>;
export type editExpenseInput = z.infer<typeof editExpenseSchema>;
export type expenseIdInput = z.infer<typeof deleteExpenseSchema>;
export type addInvoiceInput = z.infer<typeof addInvoiceSchema>;
export type editInvoiceInput = z.infer<typeof editInvoiceSchema>;
export type deleteInvoiceInput = z.infer<typeof deleteInvoiceSchema>;
export type getInvoiceByIdInput = z.infer<typeof getInvoiceByIdSchema>;

export type paginationInput = z.infer<typeof paginationSchema>;
export type paginationCategoryInput = z.infer<typeof paginationcategorySchema>;