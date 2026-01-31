import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import { Request, Response, NextFunction } from "express";
import logger from '../utils/logger.ts';
import { clearAuthCookies } from '../utils/clearCookies.ts';
import { attachUser } from '../utils/attachUser.ts';
import { AllRole } from '@prisma/client';

//All
const protectAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const accessToken = req.cookies.access;
    const refreshToken = req.cookies.refresh;

    if(accessToken){
        try {
            const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!) as { userId: string; companyId: string };

            const user = await attachUser(decoded);

            if (!user) {
                clearAuthCookies(res);
                logger.error("Invalid user");
                res.status(401);
                throw new Error("User not found");
            }

            req.user = user;

            next();

        } catch (error) {
            if (refreshToken) {
                try {
                    const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string; companyId: string };

                    const user = await attachUser(decodedRefresh);

                    if (!user) {
                        clearAuthCookies(res);
                        logger.error("Invalid user");
                        res.status(401);
                        throw new Error("User not found");
                    }

                    // Issue new access token
                    const newAccessToken = jwt.sign({ userId: user.id, companyId: user.companyId }, process.env.JWT_ACCESS_SECRET!, { expiresIn: "12h" });

                    // Send new access cookie
                    res.cookie("access", newAccessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "strict",
                        maxAge: 12 * 60 * 60 * 1000, //12 hours
                    });

                    req.user = user;

                    return next();

                } catch (refreshErr) {
                    clearAuthCookies(res);
                    res.status(401);
                    throw new Error("Session expired");
                }
            } else {
                clearAuthCookies(res);
                res.status(401);
                throw new Error("Session expired");
            }
        }
        
    }else if (refreshToken) {

        //invalid access token, check refresh token
        try {
            const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string; companyId: string };

            const user = await attachUser(decodedRefresh);

            if (!user) {
                clearAuthCookies(res);
                logger.error("Invalid user");
                res.status(401);
                throw new Error("User not found");
            }

            // Issue new access token
            const newAccessToken = jwt.sign({ userId: user.id, companyId: user.companyId }, process.env.JWT_ACCESS_SECRET!, { expiresIn: "12h" });

            // Send new access cookie
            res.cookie("access", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 12 * 60 * 60 * 1000, //12 hours
            });

            req.user = user;

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
        logger.error('Not authorized, no token')
        throw new Error('Not authorized')
    }
})

//CEO only
const protectCEO = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if (!user) {
        res.status(401)
        throw new Error('Not authorized')
    }

    if (user.role === "CEO") {
        return next();
    }else{
        res.status(403)
        throw new Error('Access denied')
    }
})

const protectCEO_COCEO_GENERAL = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    
    const user = req.user;

    if (!user) {
        res.status(401)
        throw new Error('Not authorized')
    }

    const acceptedRoles: AllRole[] = [AllRole.CEO, AllRole.CO_CEO, AllRole.GENERAL_MANAGER, AllRole.GENERAL_ACCOUNTANT];

    if (acceptedRoles.includes(user.role)) {
        return next();
    }

    res.status(403)
    throw new Error('Access Denied')

})

//CEO, CO-CEO and manager only
const  protectCEO_COCEO_GENERAL_ALL_MANAGER = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    
    const user = req.user;

    if (!user) {
        res.status(401)
        throw new Error('Not authorized')
    }

    const acceptedRoles: AllRole[] = [AllRole.CEO, AllRole.CO_CEO, AllRole.GENERAL_MANAGER, AllRole.GENERAL_ACCOUNTANT, AllRole.MANAGER];

    if (acceptedRoles.includes(user.role)) {
        return next();
    }

    res.status(403)
    throw new Error('Access denied')

})

export { protectAll, protectCEO, protectCEO_COCEO_GENERAL, protectCEO_COCEO_GENERAL_ALL_MANAGER };