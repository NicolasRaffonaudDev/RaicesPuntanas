const { prisma } = require("../db/prisma");
const { AppError } = require("../utils/app-error");
const { auditService } = require("./audit-service");
const { emailService } = require("./email-service");

const seguimientoInclude = {
  orderBy: { createdAt: "asc" },
  include: {
    autor: { select: { id: true, name: true, email: true, role: true } },
  },
};

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
        seguimientos: {
          where: { esInterno: false },
          ...seguimientoInclude,
        },
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
          seguimientos: seguimientoInclude,
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
        seguimientos: seguimientoInclude,
      },
    });

    await auditService.create({
      userId: actorUserId,
      action: "consulta.estado.update",
      meta: { consultaId: id, estado },
    });

    return updated;
  },

  listSeguimientos: async ({ consultaId, actorUserId, actorRole }) => {
    const consulta = await prisma.consulta.findUnique({
      where: { id: consultaId },
      select: { id: true, userId: true },
    });
    if (!consulta) throw new AppError(404, "Consulta no encontrada");

    const isManager = actorRole === "admin" || actorRole === "empleado";
    if (!isManager && consulta.userId !== actorUserId) {
      throw new AppError(403, "No autorizado para ver seguimiento");
    }

    return prisma.consultaSeguimiento.findMany({
      where: {
        consultaId,
        ...(isManager ? {} : { esInterno: false }),
      },
      ...seguimientoInclude,
    });
  },

  addSeguimiento: async ({ consultaId, actorUserId, mensaje, esInterno }) => {
    const consulta = await prisma.consulta.findUnique({
      where: { id: consultaId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!consulta) throw new AppError(404, "Consulta no encontrada");

    const seguimiento = await prisma.consultaSeguimiento.create({
      data: {
        consultaId,
        autorId: actorUserId,
        mensaje,
        esInterno,
      },
      include: {
        autor: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    await auditService.create({
      userId: actorUserId,
      action: "consulta.seguimiento.create",
      meta: { consultaId, esInterno },
    });

    if (!esInterno) {
      try {
        await emailService.sendConsultaReply({
          to: consulta.user.email,
          clienteNombre: consulta.user.name,
          asuntoConsulta: consulta.asunto,
          mensajeRespuesta: mensaje,
        });

        await auditService.create({
          userId: actorUserId,
          action: "consulta.seguimiento.email_sent",
          meta: { consultaId },
        });
      } catch (emailError) {
        await auditService.create({
          userId: actorUserId,
          action: "consulta.seguimiento.email_failed",
          meta: { consultaId, error: emailError instanceof Error ? emailError.message : "error_desconocido" },
        });
      }
    }

    return seguimiento;
  },
};

module.exports = { consultaService };
