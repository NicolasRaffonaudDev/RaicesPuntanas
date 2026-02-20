export type UserRole = "admin" | "empleado" | "usuario";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface SystemUser extends AuthUser {
  createdAt: string;
}
