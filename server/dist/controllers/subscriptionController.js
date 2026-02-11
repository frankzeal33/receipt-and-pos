import asyncHandler from "express-async-handler";
import prisma from "../utils/db.js";
export const getSubscriptionPlan = asyncHandler(async (req, res) => {
    const companyId = req.user?.companyId;
    const subscription = await prisma.subscription.findUnique({
        where: { companyId },
        omit: {
            userId: true,
            id: true,
            updatedAt: true,
            companyId: true
        }
    });
    res.status(200).json({
        success: true,
        message: "Subscription fetched successfully",
        result: subscription
    });
});
export const downGradeToFreePlan = asyncHandler(async (req, res) => {
    const companyId = req.user?.companyId;
    await prisma.subscription.update({
        where: { companyId },
        data: {
            plan: "FREE",
            active: true
        },
    });
    res.status(200).json({
        success: true,
        message: "Subscription downgraded to free plan",
    });
});
