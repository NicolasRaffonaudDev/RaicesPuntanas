const { AppError } = require("../utils/app-error");
const { userRepository } = require("../repositories/user-repository");
const { auditService } = require("./audit-service");
const { prisma } = require("../db/prisma");
const bcrypt = require("bcryptjs");

const userService = {
  list: async ({ page, limit, skip, search }) => {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
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

  updateRole: async ({ actorUserId, targetUserId, role }) => {
    const target = await userRepository.findById(targetUserId);
    if (!target) throw new AppError(404, "Usuario no encontrado");

    if (target.id === actorUserId && role !== "admin") {
      throw new AppError(400, "No puedes quitarte el rol admin a ti mismo");
    }

    if (target.role === "admin" && role !== "admin") {
      const adminCount = await userRepository.countAdmins();
      if (adminCount <= 1) {
        throw new AppError(400, "Debe existir al menos un administrador activo");
      }
    }

    const updated = await userRepository.update(target.id, { role });

    await auditService.create({
      userId: actorUserId,
      action: "admin.user.role_update",
      meta: { targetUserId: target.id, previousRole: target.role, nextRole: role },
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      createdAt: updated.createdAt,
    };
  },

  createByAdmin: async ({ actorUserId, data }) => {
    const email = data.email.toLowerCase();
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new AppError(409, "Ya existe un usuario con ese email");

    const passwordHash = await bcrypt.hash(data.password, 10);
    const created = await userRepository.create({
      name: data.name,
      email,
      role: data.role,
      passwordHash,
    });

    await auditService.create({
      userId: actorUserId,
      action: "admin.user.create",
      meta: { targetUserId: created.id, role: created.role },
    });

    return {
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role,
      createdAt: created.createdAt,
    };
  },
};

module.exports = { userService };
