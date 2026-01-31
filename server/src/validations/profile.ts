import { z } from "zod";

export const updateUserSchema = z.object({
  body: z.object({
    firstName: z
        .string()
        .trim()
        .min(1, "first name cannot be empty")
        .optional(),
    lastName: z
        .string()
        .trim()
        .min(1, "last name cannot be empty")
        .optional()

  })
});

export const changeUserpasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z
      .string()
      .min(8,  "New Password must be at least 8 characters")
      .regex(/[A-Z]/, "New Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "New Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "New Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "New Password must contain at least one special character")
  })
});