import { z } from "zod";
import { loginSchema, registerSchema, verifyRegLinkSchema, verifyRegSchema } from "../../validations/Auth.ts";

export type RegisterInput = z.infer<typeof registerSchema>;
export type verifyRegInput = z.infer<typeof verifyRegSchema>;
export type verifyRegLinkInput = z.infer<typeof verifyRegLinkSchema>;
export type loginInput = z.infer<typeof loginSchema>;
