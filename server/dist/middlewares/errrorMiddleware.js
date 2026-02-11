import logger from "../utils/logger.js";
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode == 200 ? 500 : res.statusCode;
    let message = err.message;
    // Attach message to res.locals for audit logging
    res.locals.message = message;
    if (process.env.NODE_ENV === "development") {
        logger.error(message);
    }
    // if(process.env.NODE_ENV === "production"){
    //     // Prisma VALIDATION errors (wrong enum, type, missing fields)
    //     if (err.name === "PrismaClientValidationError") {
    //         statusCode = 400;
    //         message = "Invalid request data";
    //     }
    //     // Rare/internal Prisma issues
    //     if (err.name === "PrismaClientUnknownRequestError") {
    //         statusCode = 400;
    //         message = "Internal error occurred";
    //     }
    //     // Prisma failed to connect
    //     if (err.name === "PrismaClientInitializationError") {
    //         statusCode = 400;
    //         message = "Database failed to connect";
    //     }
    //     // Prisma engine crashed
    //     if (err.name === "PrismaClientRustPanicError") {
    //         statusCode = 400;
    //         message = "Try again later";
    //     }
    // }
    // if(err.name === "PrismaClientKnownRequestError"){
    //     statusCode = 404;
    //     message = 'Resource not found';
    // }
    // Prisma KNOWN DB errors (unique, FK, not found)
    if (err.name === "PrismaClientKnownRequestError") {
        statusCode = 400;
        switch (err.code) {
            case "P2002":
                message = "Duplicate record";
                break;
            case "P2025":
                statusCode = 404;
                message = 'Resource not found';
                break;
            default:
                message = "Database error";
        }
    }
    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
export { notFound, errorHandler };
