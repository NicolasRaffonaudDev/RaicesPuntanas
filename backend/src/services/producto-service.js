const { AppError } = require("../utils/app-error");
const { productoRepository } = require("../repositories/producto-repository");
const { auditService } = require("./audit-service");
const { prisma } = require("../db/prisma");

const productoService = {
  list: async ({ actorRole, actorUserId, search, onlyActive, lowStock, page, limit, skip }) => {
    const where = {
      ...(search
        ? {
            OR: [
              { nombre: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(onlyActive ? { activo: true } : {}),
      ...(lowStock ? { stock: { lte: 5 } } : {}),
      ...(actorRole === "empleado" ? { createdByUserId: actorUserId } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.producto.count({ where }),
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

  create: async ({ actorUserId, data }) => {
    const existingSku = await productoRepository.findBySku(data.sku);
    if (existingSku) throw new AppError(409, "El SKU ya existe");

    const created = await productoRepository.create({
      ...data,
      createdByUserId: actorUserId,
    });
    await auditService.create({ userId: actorUserId, action: "producto.create", meta: { productoId: created.id } });
    return created;
  },

  update: async ({ actorUserId, actorRole, id, data }) => {
    const existing = await productoRepository.findById(id);
    if (!existing) throw new AppError(404, "Producto no encontrado");
    if (actorRole === "empleado" && existing.createdByUserId !== actorUserId) {
      throw new AppError(403, "Solo puedes editar productos creados por tu usuario");
    }

    const updated = await productoRepository.update(id, data);
    await auditService.create({ userId: actorUserId, action: "producto.update", meta: { productoId: id } });
    return updated;
  },

  remove: async ({ actorUserId, actorRole, id }) => {
    const existing = await productoRepository.findById(id);
    if (!existing) throw new AppError(404, "Producto no encontrado");
    if (actorRole === "empleado" && existing.createdByUserId !== actorUserId) {
      throw new AppError(403, "Solo puedes eliminar productos creados por tu usuario");
    }

    await productoRepository.remove(id);
    await auditService.create({ userId: actorUserId, action: "producto.delete", meta: { productoId: id } });
  },
};

module.exports = { productoService };
