import { Response } from "express";
import jwt from "jsonwebtoken"

const generateToken = (res: Response, data: object, rememberMe = false) => {
    const accessToken = jwt.sign(data, process.env.JWT_ACCESS_SECRET!, { expiresIn: rememberMe ? "7d" : "1d"})
    const refreshToken = jwt.sign(data, process.env.JWT_REFRESH_SECRET!, { expiresIn: rememberMe ? "60d" : "30d"})

    res.cookie("access", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: 'strict',
        maxAge: rememberMe 
        ? 7 * 24 * 60 * 60 * 1000  // 7 days
        : 24 * 60 * 60 * 1000,      // 1 day
    })

    res.cookie("refresh", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: 'strict',
        maxAge: rememberMe 
        ? 60 * 24 * 60 * 60 * 1000  // 60 days
        : 30 * 24 * 60 * 60 * 1000,      // 30 day
    })
}

export default generateToken;