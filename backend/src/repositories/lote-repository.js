const { prisma } = require("../db/prisma");

const loteRepository = {
  findAll: () =>
    prisma.lote.findMany({
      orderBy: { createdAt: "desc" },
    }),
};

module.exports = { loteRepository };
