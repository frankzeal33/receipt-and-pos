import { addMonths, addYears } from "date-fns";
export function getBaseDate(expiresAt) {
    const now = new Date();
    return expiresAt && expiresAt > now ? expiresAt : now;
}
export function calculateExpiry(billing, baseDate) {
    return billing === "MONTHLY"
        ? addMonths(baseDate, 1)
        : addYears(baseDate, 1);
}
