import { z } from "zod";
export const registerSchema = z.object({
    body: z.object({
        firstName: z.string({
            error: "First name must be a string",
        }).min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.email(),
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
export const verifyRegSchema = z.object({
    body: z.object({
        email: z.email(),
        otp: z.string().min(6, "6 digits OTP is required"),
    })
});
export const verifyRegLinkSchema = z.object({
    query: z.object({
        token: z.string().min(3, "token is required"),
    }),
});
export const loginSchema = z.object({
    body: z.object({
        email: z.email(),
        password: z.string().min(1, "Password is required"),
    })
});
export const updateSchema = z.object({
    body: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional()
    })
});
// Example: query + params
export const getUserSchema = z.object({
    body: z.object({
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        email: z.email(),
        password: z.string().min(6),
    }),
    params: z.object({
        id: z.uuid(), // /users/:id
    })
});
