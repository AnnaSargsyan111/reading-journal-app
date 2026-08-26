import type { NewUserInput, OnboardingInput, UserRecord } from "../types/user";

const USERS_KEY = "rj_users";
const SESSION_KEY = "rj_session_user_id";
const RESET_TOKENS_KEY = "rj_reset_tokens";

function readUsers(): UserRecord[] {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as UserRecord[]) : [];
}

function writeUsers(users: UserRecord[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readResetTokens(): Record<string, string> {
  const raw = localStorage.getItem(RESET_TOKENS_KEY);
  return raw ? (JSON.parse(raw) as Record<string, string>) : {};
}

function writeResetTokens(tokens: Record<string, string>): void {
  localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
}

export class AuthError extends Error {}

export function findUserByEmail(email: string): UserRecord | undefined {
  return readUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function registerUser(input: NewUserInput): UserRecord {
  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
    throw new AuthError("email_taken");
  }
  const user: UserRecord = {
    id: crypto.randomUUID(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim(),
    password: input.password,
    onboardingCompleted: false,
    onboardingSeenWelcome: false,
    genres: [],
    favoriteAuthors: [],
    aboutMe: "",
  };
  users.push(user);
  writeUsers(users);
  setSession(user.id);
  return user;
}

export function loginUser(email: string, password: string): UserRecord {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    throw new AuthError("invalid_credentials");
  }
  setSession(user.id);
  return user;
}

export function setSession(userId: string): void {
  localStorage.setItem(SESSION_KEY, userId);
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): UserRecord | undefined {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return undefined;
  return readUsers().find((u) => u.id === id);
}

export function requestPasswordReset(email: string): { token: string } | undefined {
  const user = findUserByEmail(email);
  if (!user) return undefined;
  const token = crypto.randomUUID();
  const tokens = readResetTokens();
  tokens[token] = user.id;
  writeResetTokens(tokens);
  return { token };
}

export function resetPassword(token: string, newPassword: string): void {
  const tokens = readResetTokens();
  const userId = tokens[token];
  if (!userId) throw new AuthError("invalid_token");
  const users = readUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) throw new AuthError("invalid_token");
  user.password = newPassword;
  writeUsers(users);
  delete tokens[token];
  writeResetTokens(tokens);
}

export function completeOnboarding(userId: string, input: OnboardingInput): UserRecord {
  const users = readUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) throw new AuthError("not_found");
  user.genres = input.genres;
  user.favoriteAuthors = input.favoriteAuthors;
  user.aboutMe = input.aboutMe;
  user.onboardingCompleted = true;
  writeUsers(users);
  return user;
}

export function markWelcomeSeen(userId: string): void {
  const users = readUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return;
  user.onboardingSeenWelcome = true;
  writeUsers(users);
}

export function changePassword(userId: string, currentPassword: string, newPassword: string): UserRecord {
  const users = readUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) throw new AuthError("not_found");
  if (user.password !== currentPassword) throw new AuthError("invalid_credentials");
  user.password = newPassword;
  writeUsers(users);
  return user;
}

export function updateProfile(
  userId: string,
  patch: Partial<
    Pick<UserRecord, "firstName" | "lastName" | "genres" | "favoriteAuthors" | "aboutMe" | "deliveryAddress">
  >,
): UserRecord {
  const users = readUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) throw new AuthError("not_found");
  Object.assign(user, patch);
  writeUsers(users);
  return user;
}
