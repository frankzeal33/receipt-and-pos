import { z } from "zod";
import { changeUserpasswordSchema, updateUserSchema } from "../../validations/profile.ts";

export type updateUserInput = z.infer<typeof updateUserSchema>;
export type changeUserpasswordInput = z.infer<typeof changeUserpasswordSchema>;