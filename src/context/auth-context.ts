import { createContext } from "react";
import type { AuthResponse, AuthUser } from "../types/auth";

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm extends LoginForm {
  name: string;
}

export interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  login: (payload: LoginForm) => Promise<void>;
  register: (payload: RegisterForm) => Promise<void>;
  establishSession: (session: AuthResponse) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
