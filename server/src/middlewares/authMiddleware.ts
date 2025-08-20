import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import { Request, Response, NextFunction } from "express";
import prisma from '../utils/db.ts';
import logger from '../utils/logger.ts';
import { clearAuthCookies } from '../utils/clearCookies.ts';

//Users Only
const protectCEO = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const accessToken = req.cookies.access;
    const refreshToken = req.cookies.refresh;

    if(accessToken){
        try {
            const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!) as { userId: string };

            // const user = await prisma.ceo.findUnique({
            //     where: { id: decoded.userId },
            //     select: {
            //         id: true,
            //         firstName: true,
            //         lastName: true,
            //     }
            // })
            // req.user = user

            const user = await prisma.ceo.findUnique({
                where: { id: decoded.userId }
            })

            // remove password before attaching
            if (user) {
                const { password, ...safeUser } = user
                req.user = safeUser
            } else {
                clearAuthCookies(res);

                res.status(401);
                throw new Error("User not found");
            }

            next();
            
        } catch (error) {

            //invalid access token, check refresh token
            if (refreshToken) {
                try {
                    const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };

                    const user = await prisma.ceo.findUnique({
                        where: { id: decodedRefresh.userId }
                    });

                    if (!user) {
                        clearAuthCookies(res);

                        res.status(401);
                        throw new Error("User not found");
                    }

                    // Issue new access token
                    const newAccessToken = jwt.sign({ userId: user.id },process.env.JWT_ACCESS_SECRET!,{ expiresIn: "12h" });

                    // Send new access cookie
                    res.cookie("access", newAccessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "strict",
                        maxAge: 12 * 60 * 60 * 1000, //12 hours
                    });

                    const { password, ...safeUser } = user;
                    req.user = safeUser;

                    return next();

                } catch (refreshErr) {
                    clearAuthCookies(res);

                    res.status(401);
                    logger.error("Invalid refresh token");
                    throw new Error("Session expired");
                }
            }else{
                clearAuthCookies(res);

                res.status(401);
                logger.error('Not authorized, no refresh token')
                throw new Error('Not authorized')
            }
        }
    }else{
        clearAuthCookies(res);

        res.status(401);
        logger.error('Not authorized, no token')
        throw new Error('Not authorized')
    }
})

export { protectCEO };