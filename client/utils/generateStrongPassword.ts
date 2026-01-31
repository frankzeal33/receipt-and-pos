export const generateStrongPassword = (length = 12): string => {

  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()-_=+[]{};:,.<>?";
  const all = uppercase + lowercase + numbers + special;

  // Ensure at least one of each required type
  let password =
    uppercase[Math.floor(Math.random() * uppercase.length)] +
    lowercase[Math.floor(Math.random() * lowercase.length)] +
    numbers[Math.floor(Math.random() * numbers.length)] +
    special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    const randomChar = all[Math.floor(Math.random() * all.length)];
    password += randomChar;
  }

  // Shuffle the password so it’s not predictable
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
