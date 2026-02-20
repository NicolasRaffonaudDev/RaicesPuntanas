import type { UserRole } from "../types/auth";

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    "dashboard.view",
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
    "clientes.read",
    "clientes.write",
    "productos.read",
    "productos.write",
    "ventas.read",
    "ventas.write",
    "inventario.read",
    "inventario.write",
  ],
  usuario: ["dashboard.view", "ventas.read"],
};

export const hasPermission = (role: UserRole | undefined, permission: string) => {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};