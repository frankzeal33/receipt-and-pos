import logger from "../utils/logger.js";
import { maskIDLog } from "../utils/masks.js";
import { UAParser } from "ua-parser-js";
export const auditLoggerMiddleware = (req, res, next) => {
    const start = process.hrtime(); // start timer
    res.on("finish", () => {
        const diff = process.hrtime(start); // [seconds, nanoseconds]
        const responseTimeSeconds = diff[0] + diff[1] / 1e9; // convert to seconds
        const userAgent = req.headers["user-agent"] || "";
        const parser = new UAParser();
        parser.setUA(userAgent);
        const result = parser.getResult();
        // Grab user info if authenticated
        const user = req.user || {};
        const auditLog = {
            eventTime: new Date().toLocaleString(),
            userId: user.id ? maskIDLog(user.id) : null,
            ip: req.ip,
            browser: `${result.browser.name} ${result.browser.version}`,
            os: `${result.os.name} ${result.os.version}`,
            device: result.device.model || "Desktop",
            endpoint: req.originalUrl,
            method: req.method,
            status: `${res.statusCode} (${res.statusMessage})`,
            responseTimeSeconds: responseTimeSeconds.toFixed(3) + "s",
            message: res.locals.message || null,
        };
        logger.info(auditLog);
    });
    next();
};
