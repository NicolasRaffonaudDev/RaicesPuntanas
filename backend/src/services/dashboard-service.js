const { prisma } = require("../db/prisma");
const { getPermissionsByRole } = require("../config/permissions");

const roleWidgetMap = {
  admin: ["Metricas globales", "Auditoria", "Gestion de usuarios", "Ventas e inventario"],
  empleado: ["Ventas del dia", "Inventario", "Seguimiento de clientes"],
  usuario: ["Mis operaciones", "Estado de consultas"],
};

const dashboardService = {
  getByRole: async ({ role, userId }) => {
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const salesWhere = role === "usuario" ? { userId } : {};

    const [clientes, productos, lowStock, ventasCount, ventaAgg] = await Promise.all([
      prisma.cliente.count(),
      prisma.producto.count({ where: { activo: true } }),
      prisma.producto.count({ where: { activo: true, stock: { lte: 5 } } }),
      prisma.venta.count({ where: salesWhere }),
      prisma.venta.aggregate({
        where: { ...salesWhere, createdAt: { gte: since30d } },
        _sum: { total: true },
      }),
    ]);

    return {
      summary: `Panel para rol ${role}`,
      widgets: roleWidgetMap[role] || [],
      permissions: getPermissionsByRole(role),
      metrics: {
        clientes,
        productosActivos: productos,
        productosStockBajo: lowStock,
        ventasTotales: ventasCount,
        facturacion30d: ventaAgg._sum.total || 0,
      },
    };
  },
};

module.exports = { dashboardService };
