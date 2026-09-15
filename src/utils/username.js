export const USERNAME_PATTERN = /^[a-z]+(?:\.[a-z]+)*$/;

export function normalizeUsernameInput(value = '') {
  return String(value).toLowerCase().replace(/[^a-z.]/g, '').slice(0, 80);
}

export function isValidUsername(value = '') {
  const username = String(value);
  return username.length >= 3 && username.length <= 80 && USERNAME_PATTERN.test(username);
}
