import type { UserRole } from "../types/auth";

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    "dashboard.view",
    "lotes.read",
    "favoritos.read",
    "favoritos.write",
    "consultas.read",
    "consultas.write",
    "consultas.manage",
    "clientes.read",
    "clientes.write",
    "clientes.delete",
    "productos.read",
    "productos.write",
    "productos.delete",
    "ventas.read",
    "ventas.write",
    "inventario.read",
    "inventario.write",
    "users.read",
    "users.manage",
    "audit.read",
  ],
  empleado: [
    "dashboard.view",
    "lotes.read",
    "consultas.read",
    "consultas.manage",
    "clientes.read",
    "clientes.write",
    "productos.read",
    "productos.write",
    "ventas.read",
    "ventas.write",
    "inventario.read",
    "inventario.write",
  ],
  usuario: ["dashboard.view", "lotes.read", "favoritos.read", "favoritos.write", "consultas.read", "consultas.write"],
};

export const hasPermission = (role: UserRole | undefined, permission: string) => {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};
