const { prisma } = require("../db/prisma");

const inventarioRepository = {
  listMovements: () =>
    prisma.inventarioMovimiento.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        producto: true,
        user: { select: { id: true, name: true, role: true } },
      },
    }),
};

module.exports = { inventarioRepository };