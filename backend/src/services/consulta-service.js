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

const buildPublicConsultaSubject = (lote) => {
  if (lote?.title) {
    return `Consulta por lote ${lote.title}`;
  }
  return "Consulta desde formulario publico";
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

  createPublic: async ({ data }) => {
    const lote = await prisma.lote.findUnique({ where: { id: data.loteId } });
    if (!lote) throw new AppError(404, "Lote no encontrado");

    return prisma.consulta.create({
      data: {
        userId: null,
        loteId: data.loteId,
        asunto: buildPublicConsultaSubject(lote),
        mensaje: data.mensaje,
        nombreContacto: data.nombreContacto,
        emailContacto: data.emailContacto,
        telefonoContacto: data.telefonoContacto || null,
        origen: "public_form",
        estado: "pendiente",
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        lote: true,
      },
    });
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

  listAll: async ({ page, limit, skip, q, estado, origen, loteId }) => {
    const where = {
      ...(q
        ? {
            OR: [
              { asunto: { contains: q, mode: "insensitive" } },
              { mensaje: { contains: q, mode: "insensitive" } },
              { user: { email: { contains: q, mode: "insensitive" } } },
              { user: { name: { contains: q, mode: "insensitive" } } },
              { emailContacto: { contains: q, mode: "insensitive" } },
              { nombreContacto: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(estado ? { estado } : {}),
      ...(origen ? { origen } : {}),
      ...(typeof loteId === "number" ? { loteId } : {}),
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

  updateEstadoMany: async ({ actorUserId, ids, estado }) => {
    const uniqueIds = Array.from(new Set(ids.map((id) => String(id).trim()).filter(Boolean)));
    if (uniqueIds.length === 0) throw new AppError(400, "No se recibieron consultas para actualizar");

    const existing = await prisma.consulta.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });
    if (existing.length === 0) throw new AppError(404, "No se encontraron consultas para actualizar");

    const existingIds = existing.map((item) => item.id);
    const result = await prisma.consulta.updateMany({
      where: { id: { in: existingIds } },
      data: { estado },
    });

    await auditService.create({
      userId: actorUserId,
      action: "consulta.estado.bulk_update",
      meta: { ids: existingIds, estado, count: result.count },
    });

    return {
      ids: existingIds,
      estado,
      count: result.count,
    };
  },

  updatePrioridad: async ({ actorUserId, id, prioridad }) => {
    const existing = await prisma.consulta.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "Consulta no encontrada");

    const updated = await prisma.consulta.update({
      where: { id },
      data: { prioridad },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        lote: true,
        seguimientos: seguimientoInclude,
      },
    });

    await auditService.create({
      userId: actorUserId,
      action: "consulta.prioridad.update",
      meta: { consultaId: id, prioridad },
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
        lote: { select: { title: true } },
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
      const recipientEmail = consulta.user?.email || consulta.emailContacto;
      const clienteNombre = consulta.user?.name || consulta.nombreContacto || "Cliente";

      try {
        if (recipientEmail) {
          await emailService.sendConsultaReply({
            to: recipientEmail,
            clienteNombre,
            asuntoConsulta: consulta.asunto || buildPublicConsultaSubject(consulta.lote),
            mensajeRespuesta: mensaje,
          });

          await auditService.create({
            userId: actorUserId,
            action: "consulta.seguimiento.email_sent",
            meta: { consultaId },
          });
        }
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
