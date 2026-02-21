const { AppError } = require("../utils/app-error");
const { clienteRepository } = require("../repositories/cliente-repository");
const { auditService } = require("./audit-service");
const { prisma } = require("../db/prisma");

const clienteService = {
  list: async ({ actorRole, actorUserId, search, page, limit, skip }) => {
    const where = {
      ...(search
        ? {
            OR: [
              { nombre: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { telefono: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(actorRole === "empleado" ? { createdByUserId: actorUserId } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.cliente.count({ where }),
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
    if (data.email) {
      const existing = await clienteRepository.findByEmail(data.email.toLowerCase());
      if (existing) throw new AppError(409, "Ya existe un cliente con ese email");
      data.email = data.email.toLowerCase();
    }

    const created = await clienteRepository.create({
      ...data,
      createdByUserId: actorUserId,
    });
    await auditService.create({ userId: actorUserId, action: "cliente.create", meta: { clienteId: created.id } });
    return created;
  },

  update: async ({ actorUserId, actorRole, id, data }) => {
    const existing = await clienteRepository.findById(id);
    if (!existing) throw new AppError(404, "Cliente no encontrado");
    if (actorRole === "empleado" && existing.createdByUserId !== actorUserId) {
      throw new AppError(403, "Solo puedes editar clientes creados por tu usuario");
    }

    if (data.email) {
      const email = data.email.toLowerCase();
      const foundByEmail = await clienteRepository.findByEmail(email);
      if (foundByEmail && foundByEmail.id !== id) {
        throw new AppError(409, "Ya existe un cliente con ese email");
      }
      data.email = email;
    }

    const updated = await clienteRepository.update(id, data);
    await auditService.create({ userId: actorUserId, action: "cliente.update", meta: { clienteId: id } });
    return updated;
  },

  remove: async ({ actorUserId, actorRole, id }) => {
    const existing = await clienteRepository.findById(id);
    if (!existing) throw new AppError(404, "Cliente no encontrado");
    if (actorRole === "empleado" && existing.createdByUserId !== actorUserId) {
      throw new AppError(403, "Solo puedes eliminar clientes creados por tu usuario");
    }

    await clienteRepository.remove(id);
    await auditService.create({ userId: actorUserId, action: "cliente.delete", meta: { clienteId: id } });
  },
};

module.exports = { clienteService };
