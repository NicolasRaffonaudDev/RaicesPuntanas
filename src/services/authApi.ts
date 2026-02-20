import type { AuthResponse } from "../types/auth";

const API_URL = "http://localhost:3001/api";

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
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return parseResponse(res);
  },

  register: async (body: RegisterPayload): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return parseResponse(res);
  },

  dashboard: async (token: string) => {
    const res = await fetch(`${API_URL}/dashboard/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseResponse(res);
  },

  setupAdmin: async (body: SetupAdminPayload): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/auth/setup-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return parseResponse(res);
  },
};
