const { prisma } = require("../db/prisma");

const refreshTokenRepository = {
  create: (data) =>
    prisma.refreshToken.create({
      data,
    }),

  findValidByHash: (tokenHash, now) =>
    prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      include: {
        user: true,
      },
    }),

  revokeById: (id) =>
    prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    }),

  revokeAllByUserId: (userId) =>
    prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    }),
};

module.exports = { refreshTokenRepository };
