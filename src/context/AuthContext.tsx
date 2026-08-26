import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { NewUserInput, OnboardingInput, UserRecord } from "../types/user";
import * as store from "../lib/authStore";

interface AuthContextValue {
  user: UserRecord | undefined;
  register: (input: NewUserInput) => UserRecord;
  login: (email: string, password: string) => UserRecord;
  logout: () => void;
  requestPasswordReset: (email: string) => { token: string } | undefined;
  resetPassword: (token: string, newPassword: string) => void;
  completeOnboarding: (input: OnboardingInput) => UserRecord;
  markWelcomeSeen: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRecord | undefined>(() => store.getCurrentUser());

  const refresh = () => setUser(store.getCurrentUser());

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      register: (input) => {
        const u = store.registerUser(input);
        setUser(u);
        return u;
      },
      login: (email, password) => {
        const u = store.loginUser(email, password);
        setUser(u);
        return u;
      },
      logout: () => {
        store.clearSession();
        setUser(undefined);
      },
      requestPasswordReset: (email) => store.requestPasswordReset(email),
      resetPassword: (token, newPassword) => store.resetPassword(token, newPassword),
      completeOnboarding: (input) => {
        if (!user) throw new Error("no_session");
        const u = store.completeOnboarding(user.id, input);
        setUser(u);
        return u;
      },
      markWelcomeSeen: () => {
        if (!user) return;
        store.markWelcomeSeen(user.id);
        setUser({ ...user, onboardingSeenWelcome: true });
      },
      refresh,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
