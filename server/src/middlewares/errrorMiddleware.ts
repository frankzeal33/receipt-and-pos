import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.ts";

const notFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
}

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    let statusCode = res.statusCode == 200 ? 500 : res.statusCode;
    let message = err.message;
    
    // Attach message to res.locals for audit logging
    res.locals.message = message;

    if(process.env.NODE_ENV === "development"){
        logger.error(message)
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    })

}

export {notFound, errorHandler}