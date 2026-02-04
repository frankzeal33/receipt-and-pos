import { addMonths, addYears } from "date-fns"

export function getBaseDate(expiresAt?: Date | null) {
  const now = new Date()
  return expiresAt && expiresAt > now ? expiresAt : now
}

export function calculateExpiry(
  billing: "MONTHLY" | "YEARLY",
  baseDate: Date
) {
  return billing === "MONTHLY"
    ? addMonths(baseDate, 1)
    : addYears(baseDate, 1)
}
