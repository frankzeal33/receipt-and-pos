import { Response } from "express";
import jwt from "jsonwebtoken"

const generateToken = (res: Response, userId: any) => {
    const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET!, { expiresIn: "12h"})
    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "30d"})

    res.cookie("access", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: 'strict',
        maxAge: 12 * 60 * 60 * 1000, //12 hours
    })

    res.cookie("refresh", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
    })
}

export default generateToken;