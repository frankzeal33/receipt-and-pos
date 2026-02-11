import { differenceInDays, isBefore, isToday } from "date-fns";

export const getDaysUntilRenewal = (expiresAt?: Date | string) => {
  if (!expiresAt) return null;

  const expiryDate = new Date(expiresAt);
  const today = new Date();

  if (isToday(expiryDate)) return "Renews today";
  if (isBefore(expiryDate, today)) return "Expired";

  const daysLeft = differenceInDays(expiryDate, today);
  return `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`;
};
