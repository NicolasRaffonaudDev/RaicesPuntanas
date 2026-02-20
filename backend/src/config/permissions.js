const ROLE_PERMISSIONS = {
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

const getPermissionsByRole = (role) => ROLE_PERMISSIONS[role] || [];
const hasPermission = (role, permission) => getPermissionsByRole(role).includes(permission);

module.exports = { ROLE_PERMISSIONS, getPermissionsByRole, hasPermission };
