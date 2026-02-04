import asyncHandler from "express-async-handler";
import prisma from "../utils/db.js";
import axios from "axios";
import { calculateExpiry, getBaseDate } from "../utils/subscription.js";
export const paystackVerifyPayment = asyncHandler(async (req, res) => {
    const { reference } = req.validated.body;
    const userId = req.user?.id;
    const companyId = req.user?.companyId;
    const email = req.user?.email;
    try {
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        });
        const payment = response.data.data;
        console.log("ps=", response.data.data);
        if (payment.status !== "success") {
            res.status(400);
            throw new Error("Verification Failed");
        }
        const { amount, metadata, channel, currency } = payment;
        const { plan, billing, price, title } = metadata;
        const expectedAmount = amount * 100;
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
                    amount: amount / 100,
                    email: email,
                    currency,
                    status: "SUCCESS",
                },
            });
            // Get existing subscription (if any)
            const existingSub = await tx.subscription.findUnique({
                where: { userId, companyId },
            });
            // Decide what to do based on title
            let expiresAt = null;
            switch (title) {
                case "SUBSCRIBE":
                    // First time subscription or new plan
                    const baseDateSubscribe = getBaseDate(existingSub?.expiresAt);
                    expiresAt = calculateExpiry(billing, baseDateSubscribe);
                    await tx.subscription.upsert({
                        where: { userId, companyId }, // must be unique
                        update: {
                            plan,
                            billing,
                            active: true,
                            expiresAt,
                        },
                        create: {
                            userId,
                            companyId,
                            plan,
                            billing,
                            active: true,
                            expiresAt,
                        },
                    });
                    res.json({
                        success: true,
                        message: "Subscription topped up successfully",
                        expiresAt,
                    });
                    break;
                // Monthly → Yearly (Keeps remaining time)
                case "UPGRADE":
                    if (!existingSub) {
                        res.status(400);
                        throw new Error("No active subscription to upgrade");
                    }
                    const baseDateUpgrade = getBaseDate(existingSub.expiresAt);
                    expiresAt = calculateExpiry(billing, baseDateUpgrade);
                    await tx.subscription.update({
                        where: { userId, companyId },
                        data: {
                            plan,
                            billing,
                            active: true,
                            expiresAt,
                        },
                    });
                    res.json({
                        success: true,
                        message: "Subscription upgraded to yearly",
                        expiresAt,
                    });
                    break;
                // Yearly → Monthly (Downgrade after expiry)
                case "DOWNGRADE":
                    if (!existingSub) {
                        res.status(400);
                        throw new Error("No active subscription to downgrade");
                    }
                    // schedule downgrade after current expiry
                    await tx.subscription.update({
                        where: { userId, companyId },
                        data: {
                            billing: "MONTHLY",
                        },
                    });
                    res.json({
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
                        where: { userId, companyId },
                        data: {
                            expiresAt,
                            active: true,
                        },
                    });
                    res.status(200).json({
                        success: true,
                        message: "Subscription renewed successfully",
                        expiresAt
                    });
                    break;
                default:
                    res.status(400);
                    throw new Error("Unable to detect payment plan");
                    break;
            }
        });
        res.status(200).json({
            success: true,
            message: "Payment verified and subscription updated successfully",
        });
    }
    catch (error) {
        res.status(400);
        throw new Error("Verification Failed");
    }
});
