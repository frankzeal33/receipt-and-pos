// logger.js
import pino from "pino";

const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty", // pretty logs in dev
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            // ignore: "pid,hostname",
            messageFormat: "{msg} (host:{hostname})"
          },
        }
      : undefined,
});

export default logger;
