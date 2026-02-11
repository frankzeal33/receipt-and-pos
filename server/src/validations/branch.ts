import { z } from "zod";

export const addBranchSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Branch name is required"),
    location: z.string().min(1, "Branch Address is required")
  })
});

export const editBranchSchema = z.object({
  body: z.object({
    branchId: z.string().min(2, "Branch ID is missing"),
    name: z.string().min(1, "Branch name is required").optional(),
    location: z.string().min(1, "Branch Address is required").optional()
  })
});

export const deleteBranchSchema = z.object({
  params: z.object({
    branchId: z.string().min(2, "Branch ID is missing"),
  })
});

export const enableDisableBranchSchema = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "INACTIVE"], {
      message: "Status must be ACTIVE or INACTIVE",
    })
  }),
  params: z.object({
    branchId: z.string().min(2, "Branch ID is missing"),
  })
});

export const paginationSchema = z.object({
  query: z.object({
    status: z.enum(["ACTIVE", "INACTIVE"], {
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




