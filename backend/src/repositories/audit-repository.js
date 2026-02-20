const { prisma } = require("../db/prisma");

const auditRepository = {
  create: ({ userId, action, meta }) =>
    prisma.auditLog.create({
      data: { userId, action, meta },
    }),

  list: async ({ where, skip, take }) => {
    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { data, total };
  },
};

module.exports = { auditRepository };
