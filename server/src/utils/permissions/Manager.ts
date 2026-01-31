import { AllRole, User } from "@prisma/client";
import { Response } from "express";

type MinimalUser = {
  branchId: string | null;
  role?: AllRole;
};

export function ManagerPermissions(
  loggedInUser: User,
  targetUser: MinimalUser,
  res: Response,
  checkRestricted: boolean = false
) {

  // Only check restricted roles if flag is true
  if (checkRestricted && targetUser.role) {
    // When updating staff, disallow promoting to top roles
    const restrictedRoles : AllRole[] = [AllRole.CO_CEO, AllRole.GENERAL_MANAGER,  AllRole.GENERAL_ACCOUNTANT, AllRole.MANAGER];

    if (restrictedRoles.includes(targetUser.role)) {
      res.status(400);
      throw new Error("Manager only have access to Sales Person or Accountant");
    }
  }

  if (loggedInUser.branchId !== targetUser.branchId) {
    res.status(400);
    throw new Error("Access to another branch office not permitted");
  }

}
