const { prisma } = require("../db/prisma");

const userRepository = {
  findByEmail: (email) =>
    prisma.user.findUnique({
      where: { email },
    }),

  findById: (id) =>
    prisma.user.findUnique({
      where: { id },
    }),

  create: (data) =>
    prisma.user.create({
      data,
    }),

  findAllSafe: () =>
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),

  countAdmins: () =>
    prisma.user.count({
      where: { role: "admin" },
    }),

  update: (id, data) =>
    prisma.user.update({
      where: { id },
      data,
    }),
};

module.exports = { userRepository };
