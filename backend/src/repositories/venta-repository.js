const { prisma } = require("../db/prisma");

const ventaRepository = {
  findAll: ({ userRole, userId }) => {
    const where = userRole === "usuario" ? { userId } : {};

    return prisma.venta.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        cliente: true,
        user: { select: { id: true, name: true, role: true } },
        items: {
          include: { producto: true },
        },
      },
    });
  },
};

module.exports = { ventaRepository };