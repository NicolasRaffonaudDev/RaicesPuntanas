import { useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "../services/authApi";
import { clearApiClientAuth, configureApiClientAuth } from "../services/apiClient";
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
  const [hydratedSession] = useState<AuthResponse | null>(() => hydrateSession());
  const [token, setToken] = useState<string | null>(hydratedSession?.accessToken ?? hydratedSession?.token ?? null);
  const [refreshToken, setRefreshToken] = useState<string | null>(hydratedSession?.refreshToken ?? null);
  const [user, setUser] = useState<AuthUser | null>(hydratedSession?.user ?? null);
  const [authReady, setAuthReady] = useState(false);

  const clearSession = useCallback(() => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

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

  const refreshSession = useCallback(async () => {
    if (!refreshToken) {
      clearSession();
      return null;
    }

    try {
      const refreshed = await authApi.refresh(refreshToken);
      saveSession(refreshed);
      return refreshed.accessToken || refreshed.token;
    } catch {
      clearSession();
      return null;
    }
  }, [refreshToken, clearSession, saveSession]);

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
    clearSession();
  }, [refreshToken, clearSession]);

  const logoutAll = useCallback(async () => {
    if (!token) return;
    await authApi.logoutAll(token);
    clearSession();
  }, [token, clearSession]);

  useEffect(() => {
    configureApiClientAuth({
      getAccessToken: () => token,
      getRefreshToken: () => refreshToken,
      refreshSession,
      clearSession,
    });

    return () => {
      clearApiClientAuth();
    };
  }, [token, refreshToken, refreshSession, clearSession]);

  useEffect(() => {
    let cancelled = false;

    const bootstrapAuth = async () => {
      if (!hydratedSession?.user || !hydratedSession?.refreshToken) {
        clearSession();
        if (!cancelled) setAuthReady(true);
        return;
      }

      const currentAccessToken = hydratedSession.accessToken || hydratedSession.token;
      if (!currentAccessToken) {
        clearSession();
        if (!cancelled) setAuthReady(true);
        return;
      }

      try {
        await authApi.dashboard(currentAccessToken);
      } catch {
        const refreshed = await refreshSession();
        if (!refreshed) {
          clearSession();
        }
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    };

    void bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, [hydratedSession, clearSession, refreshSession]);

  useEffect(() => {
    if (!refreshToken) return;

    const interval = window.setInterval(async () => {
      try {
        await refreshSession();
      } catch {
        clearSession();
      }
    }, 10 * 60 * 1000);

    return () => window.clearInterval(interval);
  }, [refreshToken, refreshSession, clearSession]);

  const value = useMemo(
    () => ({ token, refreshToken, user, authReady, login, register, establishSession: saveSession, logout, logoutAll }),
    [token, refreshToken, user, authReady, login, register, saveSession, logout, logoutAll],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
