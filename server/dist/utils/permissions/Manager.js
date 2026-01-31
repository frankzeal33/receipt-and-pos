import { AllRole } from "@prisma/client";
export function ManagerPermissions(loggedInUser, targetUser, res, checkRestricted = false) {
    // Only check restricted roles if flag is true
    if (checkRestricted && targetUser.role) {
        // When updating staff, disallow promoting to top roles
        const restrictedRoles = [AllRole.CO_CEO, AllRole.GENERAL_MANAGER, AllRole.GENERAL_ACCOUNTANT, AllRole.MANAGER];
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
