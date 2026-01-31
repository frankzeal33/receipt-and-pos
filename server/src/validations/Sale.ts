import { z } from "zod";

const statusEnum = z.enum([
  "CORRECTED",
  "REFUNDED"
], {
    message: "Sale status must be CORRECTED or REFUNDED",
});

const paymentMethodEnum = z.enum([
  "CASH",
  "CARD",
  "BANK_TRANSFER",
  "SPLIT"
], {
    message: "Payment type must be CASH, CARD, BANK_TRANSFER, or SPLIT",
});

export const makeSaleSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.cuid("Invalid productId"),
        quantity: z.number().int().positive("Quantity must be at least 1"),
      })
    ).min(1, "At least one item is required"),

    // Allow numbers or numeric strings; coerce to number
    discount: z
      .union([
        z.number().nonnegative("Discount cannot be negative"),
        z.string().regex(/^\d+(\.\d+)?$/, "Invalid discount format"),
      ])
      .default(0)
      .transform((v) => Number(v)),

    taxRate: z
      .union([
        z.number().min(0).max(100, "Tax rate must be 0–100"),
        z.string().regex(/^\d+(\.\d+)?$/, "Invalid taxRate format"),
      ])
      .default(0)
      .transform((v) => Number(v)),

    paymentType: paymentMethodEnum,
    customerName: z.string().min(1, "Customer name is missing"),
    customerId: z.cuid("Invalid customerId").optional(),
    customerIdentifier: z.cuid("Invalid customerId").optional(),
  }),
});

export const getSaleByIdSchema = z.object({
  params: z.object({
    saleId: z.cuid("Invalid sale Id")
  }),
});

export const correctSaleSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.cuid("Invalid productId"),
        quantity: z.number().int().positive("Quantity must be at least 1"),
      })
    ).min(1, "At least one item is required"),

    // Allow numbers or numeric strings; coerce to number
    discount: z
      .union([
        z.number().nonnegative("Discount cannot be negative"),
        z.string().regex(/^\d+(\.\d+)?$/, "Invalid discount format"),
      ])
      .default(0)
      .transform((v) => Number(v)),

    taxRate: z
      .union([
        z.number().min(0).max(100, "Tax rate must be 0-100"),
        z.string().regex(/^\d+(\.\d+)?$/, "Invalid taxRate format"),
      ])
      .default(0)
      .transform((v) => Number(v)),

    paymentType: paymentMethodEnum,
    customerName: z.string().min(1, "Customer name is missing"),
    customerId: z.cuid("Invalid CustomerId").optional(),
    customerIdentifier: z.cuid("Invalid CustomerId").optional(),
    // status: statusEnum,
  }),
  params: z.object({
    wrongSaleId: z.cuid()
  })
});

export const addCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }).refine(
    (data) => data.email || data.phone, 
    { message: "Either email or phone must be provided", path: ["body"] }
  )
});

export const editCustomerSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  params:  z.object({
    customerId: z.cuid()
  })
});

export const deleteCustomerSchema = z.object({
  params:  z.object({
    customerId: z.cuid()
  })
});
