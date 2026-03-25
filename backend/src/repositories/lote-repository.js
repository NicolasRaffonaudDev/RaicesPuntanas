const { prisma } = require("../db/prisma");

const loteRepository = {
  findAll: () =>
    prisma.lote.findMany({
      orderBy: { createdAt: "desc" },
    }),

  findPaged: ({ where, orderBy, skip, take }) =>
    prisma.lote.findMany({
      where,
      orderBy,
      skip,
      take,
    }),

  count: (where) => prisma.lote.count({ where }),

  findByIds: (ids) =>
    prisma.lote.findMany({
      where: { id: { in: ids } },
    }),

  findById: (id) => prisma.lote.findUnique({ where: { id } }),

  create: (data) => prisma.lote.create({ data }),

  update: (id, data) => prisma.lote.update({ where: { id }, data }),

  remove: (id) => prisma.lote.delete({ where: { id } }),
};

module.exports = { loteRepository };
