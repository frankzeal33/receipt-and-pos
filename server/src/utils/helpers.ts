export const cleanInput = (value: any) => {
  if (value === undefined || value === null || value === "") {
    return undefined; // skip update
  }
  return value;
}