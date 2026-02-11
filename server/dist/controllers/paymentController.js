import asyncHandler from "express-async-handler";
import prisma from "../utils/db.js";
import axios from "axios";
import { calculateExpiry, getBaseDate } from "../utils/subscription.js";
import { mapPaystackStatusToDb } from "../utils/mapPaystackStatusToDb.js";
export const paystackVerifyPayment = asyncHandler(async (req, res) => {
    const { reference } = req.validated.body;
    const userId = req.user?.id;
    const companyId = req.user?.companyId;
    const email = req.user?.email;
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
    });
    const payment = response.data.data;
    if (payment.status !== "success") {
        res.status(400);
        throw new Error("Verification Failed");
    }
    const { amount, metadata, channel, currency, status } = payment;
    const { plan, billing, price, title } = metadata;
    const expectedAmount = amount / 100;
    console.log("pa=", response.data.data);
    if (expectedAmount !== price) {
        res.status(400);
        throw new Error("Payment amount mismatch");
    }
    await prisma.$transaction(async (tx) => {
        // Save payment first
        await tx.payment.create({
            data: {
                userId,
                companyId,
                reference,
                plan,
                billing,
                channel,
                amount: expectedAmount,
                currency,
                status: mapPaystackStatusToDb(status)
            },
        });
        console.log("pays=", response.data.data);
        // Get existing subscription (if any)
        const existingSub = await tx.subscription.findUnique({
            where: { companyId },
        });
        // Decide what to do based on title
        let expiresAt = null;
        switch (title) {
            // Monthly → Yearly (Keeps remaining time)
            case "UPGRADE":
                if (!existingSub) {
                    res.status(400);
                    throw new Error("No active subscription to upgrade");
                }
                const baseDateUpgrade = getBaseDate(existingSub.expiresAt);
                expiresAt = calculateExpiry(billing, baseDateUpgrade);
                await tx.subscription.update({
                    where: { companyId },
                    data: {
                        plan,
                        billing,
                        active: true,
                        expiresAt,
                    },
                });
                res.status(200).json({
                    success: true,
                    message: "Subscription upgraded to yearly"
                });
                break;
            // Yearly → Monthly (Downgrade after expiry)
            case "DOWNGRADE":
                if (!existingSub) {
                    res.status(400);
                    throw new Error("No active subscription to downgrade");
                }
                if (plan === "FREE") {
                    res.status(400);
                    throw new Error("Free plan dont need a payment");
                }
                const baseDateDowngrade = getBaseDate(existingSub.expiresAt);
                expiresAt = calculateExpiry(billing, baseDateDowngrade);
                // schedule downgrade after current expiry
                await tx.subscription.update({
                    where: { companyId },
                    data: {
                        plan,
                        billing,
                        active: true,
                        expiresAt,
                    },
                });
                res.status(200).json({
                    success: true,
                    message: "Downgrade scheduled after current plan expires",
                });
                break;
            // Monthly -> Monthly or yearly -> yearly (Adds time)
            case "RENEW":
                if (!existingSub) {
                    res.status(400);
                    throw new Error("No active subscription to top-up");
                }
                const baseDateTopup = getBaseDate(existingSub.expiresAt);
                expiresAt = calculateExpiry(billing, baseDateTopup);
                await tx.subscription.update({
                    where: { companyId },
                    data: {
                        expiresAt,
                        active: true,
                    },
                });
                res.status(200).json({
                    success: true,
                    message: "Subscription renewed successfully"
                });
                break;
            default:
                res.status(400);
                throw new Error("Unable to detect payment plan");
        }
    });
});
export const paymentHistory = asyncHandler(async (req, res) => {
    const { page, limit } = req.validated.query;
    const skip = (page - 1) * limit;
    // filters
    const where = { companyId: req.user.companyId };
    // count
    const totalCount = await prisma.payment.count({ where });
    // fetch
    const history = await prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: {
                    email: true,
                    role: true,
                },
            },
        },
    });
    // calculate total pages
    const totalPages = Math.ceil(totalCount / limit);
    // response
    res.status(200).json({
        success: true,
        message: "Payments fetched successfully",
        pagination: {
            totalCount,
            totalPages,
            currentPage: page,
            limit,
            count: history.length,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
        },
        result: history,
    });
});
