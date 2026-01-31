import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { notFound, errorHandler } from "./middlewares/errrorMiddleware.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";
import morgan from "morgan";
import userRoute from "./routes/userRoutes.js";
import staffRoute from "./routes/staffRoutes.js";
import saleRoute from "./routes/saleRoutes.js";
import aiRoute from "./routes/aiRoutes.js";
import profileRoute from "./routes/profileRoutes.js";
import paymentRoute from "./routes/paymentRoutes.js";
import { rateLimitByIP } from "./middlewares/rateLimiterMiddleware.js";
import logger from "./utils/logger.js";
import { auditLoggerMiddleware } from "./middlewares/auditLoggerMiddleware.js";
import { UserIDForLogMiddleware } from "./middlewares/UserIDForLogMiddleware.js";
import { browserMobileOnlyMiddleware } from "./middlewares/browserMobileOnlyMiddleware.js";
import { protectAll, protectCEO_COCEO_GENERAL_ALL_MANAGER } from "./middlewares/authMiddleware.js";
const port = process.env.PORT || 5000;
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL }));
// Morgan for request logging (dev only, human-readable)
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}
else {
    // In prod, pipe Morgan logs into Pino JSON
    app.use(morgan("combined", {
        stream: {
            write: (message) => logger.info(message.trim()),
        },
    }));
}
app.use(UserIDForLogMiddleware); // sets req.user
app.use(auditLoggerMiddleware); // logs all requests including blocked ones
app.use(browserMobileOnlyMiddleware); // block Postman/cURL
// Swagger UI route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1/users', userRoute);
app.use('/api/v1/staffs', protectAll, protectCEO_COCEO_GENERAL_ALL_MANAGER, staffRoute);
app.use('/api/v1/sales', protectAll, saleRoute);
app.use('/api/v1/ai', protectAll, aiRoute);
app.use('/api/v1/profile', protectAll, profileRoute);
app.use("/api/v1/payments", paymentRoute);
app.get("/", rateLimitByIP(100, 60), (req, res) => {
    res.status(200).send("server is ready");
});
app.use(notFound);
app.use(errorHandler);
app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});
