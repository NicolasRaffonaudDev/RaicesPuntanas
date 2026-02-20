const { auditRepository } = require("../repositories/audit-repository");
const { getIO } = require("../config/socket");

const auditService = {
  create: async ({ userId, action, meta = {} }) => {
    const entry = await auditRepository.create({ userId, action, meta });
    const io = getIO();
    if (io) io.emit("audit:created", entry);
    return entry;
  },

  list: async ({ page, limit, skip, search, action, userId, from, to }) => {
    const where = {
      ...(action ? { action: { equals: action } } : {}),
      ...(userId ? { userId } : {}),
      ...(search
        ? {
            OR: [
              { action: { contains: search, mode: "insensitive" } },
              { user: { email: { contains: search, mode: "insensitive" } } },
              { user: { name: { contains: search, mode: "insensitive" } } },
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

    const { data, total } = await auditRepository.list({ where, skip, take: limit });

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
};

module.exports = { auditService };
