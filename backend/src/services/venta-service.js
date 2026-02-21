const { prisma } = require("../db/prisma");
const { AppError } = require("../utils/app-error");
const { auditService } = require("./audit-service");

const ventaService = {
  list: async ({ userRole, userId, search, from, to, page, limit, skip }) => {
    const where = {
      ...(userRole === "usuario" || userRole === "empleado" ? { userId } : {}),
      ...(search
        ? {
            OR: [
              { id: { contains: search, mode: "insensitive" } },
              { cliente: { nombre: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
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
      prisma.venta.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          cliente: true,
          user: { select: { id: true, name: true, role: true } },
          items: { include: { producto: true } },
        },
      }),
      prisma.venta.count({ where }),
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

  create: async ({ actorUserId, clienteId, items }) => {
    const productIds = [...new Set(items.map((item) => item.productoId))];
    const products = await prisma.producto.findMany({ where: { id: { in: productIds }, activo: true } });

    if (products.length !== productIds.length) {
      throw new AppError(400, "Uno o mas productos no existen o estan inactivos");
    }

    const productById = new Map(products.map((p) => [p.id, p]));

    const parsedItems = items.map((item) => {
      const producto = productById.get(item.productoId);
      if (!producto) throw new AppError(400, "Producto invalido en items");
      if (producto.stock < item.cantidad) {
        throw new AppError(400, `Stock insuficiente para ${producto.nombre}`);
      }

      const subtotal = producto.precio * item.cantidad;
      return {
        producto,
        cantidad: item.cantidad,
        precioUnit: producto.precio,
        subtotal,
      };
    });

    const total = parsedItems.reduce((acc, item) => acc + item.subtotal, 0);

    const venta = await prisma.$transaction(async (tx) => {
      if (clienteId) {
        const clienteExists = await tx.cliente.findUnique({ where: { id: clienteId } });
        if (!clienteExists) throw new AppError(404, "Cliente no encontrado");
      }

      for (const item of parsedItems) {
        await tx.producto.update({
          where: { id: item.producto.id },
          data: { stock: { decrement: item.cantidad } },
        });

        await tx.inventarioMovimiento.create({
          data: {
            productoId: item.producto.id,
            userId: actorUserId,
            tipo: "salida",
            cantidad: item.cantidad,
            motivo: "Venta",
          },
        });
      }

      const createdVenta = await tx.venta.create({
        data: {
          clienteId,
          userId: actorUserId,
          total,
          items: {
            create: parsedItems.map((item) => ({
              productoId: item.producto.id,
              cantidad: item.cantidad,
              precioUnit: item.precioUnit,
              subtotal: item.subtotal,
            })),
          },
        },
        include: {
          cliente: true,
          user: { select: { id: true, name: true, role: true } },
          items: { include: { producto: true } },
        },
      });

      return createdVenta;
    });

    await auditService.create({
      userId: actorUserId,
      action: "venta.create",
      meta: { ventaId: venta.id, total, itemCount: items.length },
    });

    return venta;
  },
};

module.exports = { ventaService };
