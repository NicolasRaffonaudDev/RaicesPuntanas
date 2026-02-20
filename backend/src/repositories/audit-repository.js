const { prisma } = require("../db/prisma");

const auditRepository = {
  create: ({ userId, action, meta }) =>
    prisma.auditLog.create({
      data: { userId, action, meta },
    }),

  findRecent: (limit = 200) =>
    prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    }),
};

module.exports = { auditRepository };
