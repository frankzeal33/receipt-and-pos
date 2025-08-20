import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import { Request, Response, NextFunction } from "express";

//Users Only
const protectCEO = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let token;

    token = req.cookies.jwt;

    if(token){
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

            // req.user = await User.findById(decoded.userId).select('-password');

            next();
            
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, Invalid token')
        }
    }else{
        res.status(401);
        throw new Error('Not authorized, no token')
    }
})

export { protectCEO };