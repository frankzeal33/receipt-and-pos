import { z } from "zod";
export const addStaffSchema = z.object({
    body: z.object({
        branchId: z.string().optional(),
        firstName: z.string({
            error: "First name must be a string",
        }).min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.email(),
        role: z.enum(["CO_CEO", "GENERAL_MANAGER", "GENERAL_ACCOUNTANT", "MANAGER", "ACCOUNTANT", "SALES_PERSON"], {
            message: "Role must be CO_CEO, GENERAL_MANAGER, GENERAL_ACCOUNTANT, MANAGER, ACCOUNTANT or SALES_PERSON"
        }),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
            .meta({ description: "Password must be strong and secure" }),
    })
});
export const editStaffSchema = z.object({
    body: z.object({
        staffId: z.string().min(2, "Staff ID is missing"),
        firstName: z.string().min(1, "First name is required").optional(),
        lastName: z.string().min(1, "Last name is required").optional(),
        role: z.enum(["CO_CEO", "MANAGER", "SALES_PERSON"], {
            message: "Role must be CO_CEO, MANAGER, or SALES_PERSON",
        }).optional(),
        status: z.enum(["ACTIVE", "IN_ACTIVE"], {
            message: "Status must be ACTIVE or IN_ACTIVE",
        }).optional()
    }),
});
export const deleteStaffSchema = z.object({
    params: z.object({
        staffId: z.string().min(2, "Staff ID is missing"),
    })
});
export const addProductSchema = z.object({
    body: z.object({
        branchId: z.string().optional(),
        productName: z.string().min(1, "Product name is required"),
        productDesc: z.string().optional(),
        category: z.string().optional(),
        brand: z.string().optional(),
        price: z.string()
            .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format") // format only
            .transform((val) => parseFloat(val)) // convert to number
            .refine((val) => val >= 0.01, { message: "Price must be at least 0.01" }),
        quantity: z.number().min(0, "Quantity must be 0 or more"),
        status: z.enum(["IN_STOCK", "OUT_OF_STOCK", "LOW_STOCK"], {
            message: "Status must be IN_STOCK, OUT_OF_STOCK, or LOW_STOCK",
        })
    })
});
export const editProductSchema = z.object({
    body: z.object({
        branchId: z.string().optional(),
        productId: z.string().min(2, "Product ID is missing"),
        productName: z.string().min(1, "Product name is required").optional(),
        productDesc: z.string().optional(),
        category: z.string().optional(),
        brand: z.string().optional(),
        price: z.string()
            .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format") // format only
            .transform((val) => parseFloat(val)) // convert to number
            .refine((val) => val >= 0.01, { message: "Price must be at least 0.01" }).optional(),
        quantity: z.number().min(0, "Quantity must be 0 or more").optional(),
        status: z.enum(["IN_STOCK", "OUT_OF_STOCK", "LOW_STOCK"], {
            message: "Status must be IN_STOCK, OUT_OF_STOCK, or LOW_STOCK",
        }).optional(),
    })
});
export const productIdSchema = z.object({
    params: z.object({
        productId: z.string().min(2, "Product ID is missing"),
    })
});
export const addExpenseSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Expense title is missing"),
        description: z.string().optional(),
        category: z.enum(["UTILITIES", "SUPPLIES", "MAINTENANCE", "MARKETING", "TAXES", "OTHER"], {
            message: "Invalid category",
        }),
        amount: z.string()
            .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format") // e.g. 123 or 123.45
            .transform((val) => parseFloat(val)) // convert to number
            .refine((val) => val >= 0.01, { message: "Price must be at least 0.01" }),
        paymentType: z.enum(["CASH", "CARD", "BANK_TRANSFER", "OTHER"], {
            message: "Invalid payment type",
        }),
        expenseDate: z.string()
            .refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid ISO date format",
        })
            .transform((val) => new Date(val)),
    })
});
export const editExpenseSchema = z.object({
    body: z.object({
        branchId: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.enum(["UTILITIES", "SUPPLIES", "MAINTENANCE", "MARKETING", "TAXES", "OTHER"], {
            message: "Invalid category",
        }).optional(),
        amount: z.string()
            .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format") // e.g. 123 or 123.45
            .transform((val) => parseFloat(val)) // convert to number
            .refine((val) => val >= 0.01, { message: "Price must be at least 0.01" }).optional(),
        paymentType: z.enum(["CASH", "CARD", "BANK_TRANSFER", "OTHER"], {
            message: "Invalid payment type",
        }).optional(),
        expenseDate: z.string()
            .refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid ISO date format",
        })
            .transform((val) => new Date(val)).optional(),
    }),
    params: z.object({
        expenseId: z.string().min(2, "Expense ID is missing"),
    })
});
export const deleteExpenseSchema = z.object({
    body: z.object({
        branchId: z.string().optional(),
    }),
    params: z.object({
        expenseId: z.string().min(2, "Expense ID is missing"),
    })
});
export const addInvoiceSchema = z.object({
    body: z.object({
        invoiceName: z.string().min(1, "Invoice name is missing"),
        note: z.string().optional(),
        extraChargeName: z.string().optional(),
        paymentTerm: z.string().optional(),
        extraCharge: z
            .union([
            z.number().nonnegative("Extra charge cannot be negative"),
            z.string().regex(/^\d+(\.\d+)?$/, "Invalid charge format"),
        ])
            .default(0)
            .transform((v) => Number(v)).optional(),
        discountName: z.string().optional(),
        discount: z
            .union([
            z.number().nonnegative("Discount cannot be negative"),
            z.string().regex(/^\d+(\.\d+)?$/, "Invalid discount format"),
        ])
            .default(0)
            .transform((v) => Number(v)).optional(),
        status: z.enum(["PAID", "UNPAID"], {
            message: "Invalid invoice status",
        }),
        totalAmount: z.string()
            .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format") // e.g. 123 or 123.45
            .transform((val) => parseFloat(val)) // convert to number
            .refine((val) => val >= 0.01, { message: "Price must be at least 0.01" }),
        totalTaxAmount: z.string()
            .regex(/^\d+(\.\d{1,2})?$/, "Invalid tax amount format")
            .transform((val) => parseFloat(val)).optional(),
        date: z.string()
            .refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid ISO date format",
        })
            .transform((val) => new Date(val)),
        dueDate: z.string()
            .refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid ISO date format",
        })
            .transform((val) => new Date(val)),
        businessName: z.string().min(1, "Business name is missing"),
        email: z.string().min(1, "Business email is missing"),
        phone: z.string().min(1, "Phone no is missing"),
        address: z.string().min(1, "Business address is missing"),
        customerName: z.string().min(1, "Customer name is missing"),
        customerEmail: z.string().min(1, "Customer email is missing"),
        customerPhone: z.string().min(1, "Customer phone is missing"),
        customerAddress: z.string().min(1, "Customer address is missing"),
        currency: z.string().min(1, "Currency is missing"),
        invoiceItems: z.array(z.object({
            itemQuantity: z.number().int().positive("Quantity must be at least 1"),
            itemTitle: z.string().min(1, "Currency is missing"),
            itemAmount: z.string()
                .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format")
                .transform((val) => parseFloat(val)),
            itemTotal: z.string()
                .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format")
                .transform((val) => parseFloat(val)),
            tax: z
                .number()
                .min(0, "Tax rate must be between 0 and 100")
                .max(100, "Tax rate must be between 0 and 100")
                .default(0)
                .optional(),
        })).min(1, "At least one item is required"),
        branchId: z.string().optional(),
    })
});
export const editInvoiceSchema = z.object({
    body: z.object({
        branchId: z.string().optional(),
        invoiceName: z.string().min(1, "Invoice name is missing"),
        note: z.string().optional(),
        extraChargeName: z.string().optional(),
        paymentTerm: z.string().optional(),
        extraCharge: z
            .union([
            z.number().nonnegative("Extra charge cannot be negative"),
            z.string().regex(/^\d+(\.\d+)?$/, "Invalid charge format"),
        ])
            .default(0)
            .transform((v) => Number(v)).optional(),
        discountName: z.string().optional(),
        discount: z
            .union([
            z.number().nonnegative("Discount cannot be negative"),
            z.string().regex(/^\d+(\.\d+)?$/, "Invalid discount format"),
        ])
            .default(0)
            .transform((v) => Number(v)).optional(),
        status: z.enum(["PAID", "UNPAID"], {
            message: "Invalid invoice status",
        }),
        totalAmount: z.string()
            .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format") // e.g. 123 or 123.45
            .transform((val) => parseFloat(val)) // convert to number
            .refine((val) => val >= 0.01, { message: "Price must be at least 0.01" }),
        totalTaxAmount: z.string()
            .regex(/^\d+(\.\d{1,2})?$/, "Invalid tax amount format")
            .transform((val) => parseFloat(val)).optional(),
        date: z.string()
            .refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid ISO date format",
        })
            .transform((val) => new Date(val)),
        dueDate: z.string()
            .refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid ISO date format",
        })
            .transform((val) => new Date(val)),
        businessName: z.string().min(1, "Business name is missing"),
        email: z.string().min(1, "Business email is missing"),
        phone: z.string().min(1, "Phone no is missing"),
        address: z.string().min(1, "Business address is missing"),
        customerName: z.string().min(1, "Customer name is missing"),
        customerEmail: z.string().optional(),
        customerPhone: z.string().optional(),
        customerAddress: z.string().optional(),
        currency: z.string().min(1, "Currency is missing"),
        invoiceItems: z.array(z.object({
            itemQuantity: z.number().int().positive("Quantity must be at least 1"),
            itemTitle: z.string().min(1, "Currency is missing"),
            itemAmount: z.string()
                .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format") // e.g. 123 or 123.45
                .transform((val) => parseFloat(val)) // convert to number
                .refine((val) => val >= 0.01, { message: "Price must be at least 0.01" }),
            itemTotal: z.string()
                .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format")
                .transform((val) => parseFloat(val)),
            tax: z
                .number()
                .min(0, "Tax rate must be between 0 and 100")
                .max(100, "Tax rate must be between 0 and 100")
                .default(0)
                .optional(),
        })).min(1, "At least one item is required"),
    }),
    params: z.object({
        invoiceId: z.string().min(2, "Invoice ID is missing"),
    })
});
export const deleteInvoiceSchema = z.object({
    body: z.object({
        branchId: z.string().optional(),
    }),
    params: z.object({
        invoiceId: z.string().min(2, "Invoice ID is missing"),
    })
});
export const getInvoiceByIdSchema = z.object({
    params: z.object({
        invoiceId: z.string().min(2, "Invoice ID is missing"),
    })
});
export const paginationSchema = z.object({
    query: z.object({
        status: z.enum(["CORRECTED", "PAID", "REFUNDED"], {
            message: "Invalid status",
        }).optional(),
        search: z.string().optional(),
        role: z.string().optional(),
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
export const paginationcategorySchema = z.object({
    query: z.object({
        search: z.string().optional(),
        role: z.string().optional(),
        category: z.string().optional(),
        startDate: z.string()
            .refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid ISO date format",
        })
            .transform((val) => new Date(val)).optional(),
        endDate: z.string()
            .refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid ISO date format",
        })
            .transform((val) => new Date(val)).optional(),
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
