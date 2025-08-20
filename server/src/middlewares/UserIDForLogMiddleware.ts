import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from "express";

const UserIDForLogMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    token = req.cookies.jwt;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

        req.user = { id: decoded.userId }

        next();
        
    } catch (error) {
        // Invalid token, treat as unauthenticated
        return next();
    }
}

export { UserIDForLogMiddleware };