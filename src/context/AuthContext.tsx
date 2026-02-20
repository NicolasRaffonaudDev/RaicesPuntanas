import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [token, setToken] = useState<string | null>(currentSession?.accessToken ?? currentSession?.token ?? null);
  const [refreshToken, setRefreshToken] = useState<string | null>(currentSession?.refreshToken ?? null);
  const [user, setUser] = useState<AuthUser | null>(currentSession?.user ?? null);

  const saveSession = useCallback((session: AuthResponse) => {
    const accessToken = session.accessToken || session.token;
    setToken(accessToken);
    setRefreshToken(session.refreshToken);
    setUser(session.user);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...session,
        token: accessToken,
        accessToken,
      }),
    );
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
    const currentRefreshToken = refreshToken;
    if (currentRefreshToken) {
      void authApi.logout(currentRefreshToken).catch(() => undefined);
    }
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, [refreshToken]);

  const logoutAll = useCallback(async () => {
    if (!token) return;
    await authApi.logoutAll(token);
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, [token]);

  useEffect(() => {
    if (!refreshToken) return;

    const interval = window.setInterval(async () => {
      try {
        const refreshed = await authApi.refresh(refreshToken);
        saveSession(refreshed);
      } catch {
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    }, 10 * 60 * 1000);

    return () => window.clearInterval(interval);
  }, [refreshToken, saveSession]);

  const value = useMemo(
    () => ({ token, refreshToken, user, login, register, establishSession: saveSession, logout, logoutAll }),
    [token, refreshToken, user, login, register, saveSession, logout, logoutAll],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};