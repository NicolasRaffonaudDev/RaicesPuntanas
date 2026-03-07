const { prisma } = require("../db/prisma");

const loteRepository = {
  findAll: () =>
    prisma.lote.findMany({
      orderBy: { createdAt: "desc" },
    }),

  findById: (id) => prisma.lote.findUnique({ where: { id } }),

  create: (data) => prisma.lote.create({ data }),

  update: (id, data) => prisma.lote.update({ where: { id }, data }),

  remove: (id) => prisma.lote.delete({ where: { id } }),
};

module.exports = { loteRepository };
