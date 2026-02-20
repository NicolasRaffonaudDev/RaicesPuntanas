const { prisma } = require("../db/prisma");

const clienteRepository = {
  findAll: () => prisma.cliente.findMany({ orderBy: { createdAt: "desc" } }),

  findById: (id) => prisma.cliente.findUnique({ where: { id } }),

  findByEmail: (email) => prisma.cliente.findUnique({ where: { email } }),

  create: (data) => prisma.cliente.create({ data }),

  update: (id, data) => prisma.cliente.update({ where: { id }, data }),

  remove: (id) => prisma.cliente.delete({ where: { id } }),
};

module.exports = { clienteRepository };