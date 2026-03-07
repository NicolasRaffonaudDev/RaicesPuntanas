const ROLE_PERMISSIONS = {
  admin: [
    "dashboard.view",
    "lotes.read",
    "lotes.write",
    "lotes.delete",
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
    "favoritos.read",
    "favoritos.write",
    "consultas.read",
    "consultas.write",
    "consultas.manage",
  ],
  empleado: [
    "dashboard.view",
    "lotes.read",
    "clientes.read",
    "clientes.write",
    "productos.read",
    "productos.write",
    "ventas.read",
    "ventas.write",
    "inventario.read",
    "inventario.write",
    "consultas.read",
    "consultas.manage",
  ],
  usuario: [
    "dashboard.view",
    "lotes.read",
    "ventas.read",
    "favoritos.read",
    "favoritos.write",
    "consultas.read",
    "consultas.write",
  ],
};

const getPermissionsByRole = (role) => ROLE_PERMISSIONS[role] || [];
const hasPermission = (role, permission) => getPermissionsByRole(role).includes(permission);

module.exports = { ROLE_PERMISSIONS, getPermissionsByRole, hasPermission };
