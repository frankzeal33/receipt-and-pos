import crypto from "crypto";

// Generate random OTP (6-digit)
export const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate secure token
export const generateFrontendToken = () => crypto.randomBytes(32).toString("hex");