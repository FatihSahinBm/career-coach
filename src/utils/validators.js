/**
 * Custom validation functions
 */

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isStrongPassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return password.length >= 8 &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /[0-9]/.test(password);
}

export function isValidProficiency(proficiency) {
  return Number.isInteger(proficiency) && proficiency >= 1 && proficiency <= 5;
}

export function isValidDifficulty(difficulty) {
  return ['junior', 'mid', 'senior'].includes(difficulty);
}

export function isValidStatus(status, allowedStatuses) {
  return allowedStatuses.includes(status);
}
