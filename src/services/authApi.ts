import { apiRequest } from "./apiClient";
import type { AuthResponse } from "../types/auth";

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface SetupAdminPayload {
  setupKey: string;
  name: string;
  email: string;
  password: string;
}

const parseResponse = async (res: Response) => {
  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.message || "Error de servidor");
  }
  return payload;
};

export const authApi = {
  login: async (body: LoginPayload): Promise<AuthResponse> => {
    const res = await apiRequest("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      skipAuth: true,
    });
    return parseResponse(res);
  },

  register: async (body: RegisterPayload): Promise<AuthResponse> => {
    const res = await apiRequest("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      skipAuth: true,
    });
    return parseResponse(res);
  },

  dashboard: async (token: string) => {
    const res = await apiRequest("/dashboard/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseResponse(res);
  },

  setupAdmin: async (body: SetupAdminPayload): Promise<AuthResponse> => {
    const res = await apiRequest("/auth/setup-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      skipAuth: true,
    });
    return parseResponse(res);
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const res = await apiRequest("/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      skipAuth: true,
      retryOn401: false,
    });
    return parseResponse(res);
  },

  logout: async (refreshToken: string) => {
    const res = await apiRequest("/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      skipAuth: true,
      retryOn401: false,
    });
    return parseResponse(res);
  },

  logoutAll: async (token: string) => {
    const res = await apiRequest("/auth/logout-all", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseResponse(res);
  },
};
