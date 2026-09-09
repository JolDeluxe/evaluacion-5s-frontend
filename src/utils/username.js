export const USERNAME_PATTERN = /^[a-z]{3,80}$/;

export function normalizeUsernameInput(value = '') {
  return String(value).toLowerCase().replace(/[^a-z]/g, '').slice(0, 80);
}

export function isValidUsername(value = '') {
  return USERNAME_PATTERN.test(value);
}
