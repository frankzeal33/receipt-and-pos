import { z } from "zod";
import { addBranchSchema, deleteBranchSchema, editBranchSchema, enableDisableBranchSchema, paginationSchema } from "../../validations/branch.ts";

export type addBranchInput = z.infer<typeof addBranchSchema>;
export type editBranchInput = z.infer<typeof editBranchSchema>;
export type deleteBranchInput = z.infer<typeof deleteBranchSchema>;
export type enableDisableBranchInput = z.infer<typeof enableDisableBranchSchema>

export type paginationInput = z.infer<typeof paginationSchema>;