import { Request, Response, NextFunction } from "express";
import { incrCache } from "../utils/cacheInstance.ts";

/**
 * Rate limit by IP
 * @param limit number of allowed attempts
 * @param ttlSeconds time window in seconds
 */
export function rateLimitByIP(limit: number, ttlSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const key = `ip_${ip}`;

    const count = await incrCache(key, ttlSeconds);

    if (count > limit) {
      return res.status(429).json({ message: "Too many requests from this IP" });
    }

    next();
  };
}

/**
 * Rate limit by a body field (e.g. "email")
 * @param field body field to check
 * @param limit number of allowed attempts
 * @param ttlSeconds time window in seconds
 */
export function rateLimitByField(field: string, limit: number, ttlSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const value = req.body[field];
    if (!value) {
      return res.status(400).json({ message: `${field} is required` });
    }

    const key = `${field}_${value}`;
    const count = await incrCache(key, ttlSeconds);

    if (count > limit) {
      return res.status(429).json({ message: `Too many attempts for this ${field}` });
    }

    next();
  };
}
