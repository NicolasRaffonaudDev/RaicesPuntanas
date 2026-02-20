const { prisma } = require("../db/prisma");
const { AppError } = require("../utils/app-error");
const { auditService } = require("./audit-service");

const inventarioService = {
  listMovements: async ({ tipo, from, to, page, limit, skip }) => {
    const where = {
      ...(tipo ? { tipo } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.inventarioMovimiento.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          producto: true,
          user: { select: { id: true, name: true, role: true } },
        },
      }),
      prisma.inventarioMovimiento.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  createMovement: async ({ actorUserId, data }) => {
    const producto = await prisma.producto.findUnique({ where: { id: data.productoId } });
    if (!producto) throw new AppError(404, "Producto no encontrado");

    let newStock = producto.stock;
    if (data.tipo === "entrada") newStock += data.cantidad;
    if (data.tipo === "salida") newStock -= data.cantidad;
    if (data.tipo === "ajuste") newStock = data.cantidad;

    if (newStock < 0) throw new AppError(400, "El movimiento deja stock negativo");

    const movement = await prisma.$transaction(async (tx) => {
      await tx.producto.update({ where: { id: producto.id }, data: { stock: newStock } });

      return tx.inventarioMovimiento.create({
        data: {
          productoId: producto.id,
          userId: actorUserId,
          tipo: data.tipo,
          cantidad: data.cantidad,
          motivo: data.motivo,
        },
        include: {
          producto: true,
          user: { select: { id: true, name: true, role: true } },
        },
      });
    });

    await auditService.create({
      userId: actorUserId,
      action: "inventario.movement",
      meta: { productoId: producto.id, tipo: data.tipo, cantidad: data.cantidad, stock: newStock },
    });

    return movement;
  },
};

module.exports = { inventarioService };
