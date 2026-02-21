const { prisma } = require("../db/prisma");
const { AppError } = require("../utils/app-error");
const { auditService } = require("./audit-service");

const consultaService = {
  create: async ({ userId, data }) => {
    if (data.loteId) {
      const lote = await prisma.lote.findUnique({ where: { id: data.loteId } });
      if (!lote) throw new AppError(404, "Lote no encontrado");
    }

    const consulta = await prisma.consulta.create({
      data: {
        userId,
        loteId: data.loteId,
        asunto: data.asunto,
        mensaje: data.mensaje,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        lote: true,
      },
    });

    await auditService.create({ userId, action: "consulta.create", meta: { consultaId: consulta.id } });
    return consulta;
  },

  listMine: async ({ userId }) =>
    prisma.consulta.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        lote: true,
      },
    }),

  listAll: async ({ page, limit, skip, search, estado }) => {
    const where = {
      ...(search
        ? {
            OR: [
              { asunto: { contains: search, mode: "insensitive" } },
              { mensaje: { contains: search, mode: "insensitive" } },
              { user: { email: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(estado ? { estado } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.consulta.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          lote: true,
        },
      }),
      prisma.consulta.count({ where }),
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

  updateEstado: async ({ actorUserId, id, estado }) => {
    const existing = await prisma.consulta.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "Consulta no encontrada");

    const updated = await prisma.consulta.update({
      where: { id },
      data: { estado },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        lote: true,
      },
    });

    await auditService.create({
      userId: actorUserId,
      action: "consulta.estado.update",
      meta: { consultaId: id, estado },
    });

    return updated;
  },
};

module.exports = { consultaService };