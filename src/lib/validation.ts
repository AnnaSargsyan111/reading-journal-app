const LATIN_NAME_RE = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 32;

export interface PasswordCheck {
  minLength: boolean;
  maxLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export function checkPassword(value: string): PasswordCheck {
  return {
    minLength: value.length >= PASSWORD_MIN,
    maxLength: value.length > 0 && value.length <= PASSWORD_MAX,
    hasUppercase: /[A-Z]/.test(value),
    hasNumber: /[0-9]/.test(value),
    hasSpecialChar: /[^A-Za-z0-9]/.test(value),
  };
}

export function isPasswordValid(value: string): boolean {
  const check = checkPassword(value);
  return Object.values(check).every(Boolean);
}

export function isLatinName(value: string): boolean {
  return LATIN_NAME_RE.test(value.trim());
}

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}
