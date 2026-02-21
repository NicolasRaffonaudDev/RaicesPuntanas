const { prisma } = require("../db/prisma");
const { AppError } = require("../utils/app-error");
const { auditService } = require("./audit-service");

const favoritoService = {
  listMine: async ({ userId }) =>
    prisma.loteFavorito.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { lote: true },
    }),

  add: async ({ userId, loteId }) => {
    const lote = await prisma.lote.findUnique({ where: { id: loteId } });
    if (!lote) throw new AppError(404, "Lote no encontrado");

    const fav = await prisma.loteFavorito.upsert({
      where: { userId_loteId: { userId, loteId } },
      create: { userId, loteId },
      update: {},
      include: { lote: true },
    });

    await auditService.create({ userId, action: "lote.favorito.add", meta: { loteId } });
    return fav;
  },

  remove: async ({ userId, loteId }) => {
    const existing = await prisma.loteFavorito.findUnique({
      where: { userId_loteId: { userId, loteId } },
    });
    if (!existing) throw new AppError(404, "Favorito no encontrado");

    await prisma.loteFavorito.delete({ where: { id: existing.id } });
    await auditService.create({ userId, action: "lote.favorito.remove", meta: { loteId } });
  },
};

module.exports = { favoritoService };