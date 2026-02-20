import { useCallback, useMemo, useState } from "react";
import { authApi } from "../services/authApi";
import type { AuthResponse, AuthUser } from "../types/auth";
import { AuthContext } from "./auth-context";

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm extends LoginForm {
  name: string;
}

const STORAGE_KEY = "raices-puntanas-auth";

const hydrateSession = (): AuthResponse | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const currentSession = hydrateSession();
  const [token, setToken] = useState<string | null>(currentSession?.token ?? null);
  const [user, setUser] = useState<AuthUser | null>(currentSession?.user ?? null);

  const saveSession = useCallback((session: AuthResponse) => {
    setToken(session.token);
    setUser(session.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, []);

  const login = useCallback(
    async (payload: LoginForm) => {
      const session = await authApi.login(payload);
      saveSession(session);
    },
    [saveSession],
  );

  const register = useCallback(
    async (payload: RegisterForm) => {
      const session = await authApi.register(payload);
      saveSession(session);
    },
    [saveSession],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ token, user, login, register, logout }),
    [token, user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
