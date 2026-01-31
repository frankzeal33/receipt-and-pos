import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import prisma from "../utils/db.ts";
import axios from "axios"

export const paystack = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    
    const { reference } = req.body

    if (!reference) {
        throw new Error("Missing reference")
    }

    try {
        const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        }
        )

        res.status(200).json({
            success: true,
            message: "payment verified successfully",
            result: response.data.data
        });

        // const payment = response.data.data

        // if (payment.status !== "success") {
        //     return res.status(400).json({ status: "failed" })
        // }

        // const {
        //     amount,
        //     metadata,
        //     customer,
        // } = payment

        // // 🔥 metadata sent from frontend
        // const { plan, billing, price, userId } = metadata

        // // save payment
        // await Payment.create({
        //     userId,
        //     reference,
        //     plan,
        //     billing,
        //     amount: amount / 100,
        //     email: customer.email,
        //     status: "success",
        // })

        // // upgrade user
        // await User.findByIdAndUpdate(userId, {
        //     subscription: {
        //     plan,
        //     billing,
        //     active: true,
        //     expiresAt:
        //         billing === "monthly"
        //         ? addMonths(new Date(), 1)
        //         : addYears(new Date(), 1),
        //     },
        // })

        // res.json({ status: "success" })

    }  catch (error: any) {
        throw new Error("Verification failed")
    } 
  
});