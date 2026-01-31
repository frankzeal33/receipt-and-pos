import { z } from "zod";
import { forgotPasswordSchema, loginSchema, registerSchema, resendRegVerificationSchema, resetPasswordSchema, updateSchema, verifyRegLinkSchema, verifyRegSchema } from "../../validations/Auth.ts";

export type registerInput = z.infer<typeof registerSchema>;
export type verifyRegInput = z.infer<typeof verifyRegSchema>;
export type verifyRegLinkInput = z.infer<typeof verifyRegLinkSchema>;
export type resendRegVerificationInput = z.infer<typeof resendRegVerificationSchema>;
export type loginInput = z.infer<typeof loginSchema>;
export type updateInput = z.infer<typeof updateSchema>;
export type forgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type resetPasswordInput = z.infer<typeof resetPasswordSchema>;
