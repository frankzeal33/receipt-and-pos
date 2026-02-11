/**
 * Converts uppercase or underscored text (like "IN_PLACE") 
 * into title case (e.g. "In Place").
 */
export const formatEnums = (text: string): string => {
  if (!text) return "";
  return text
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};
