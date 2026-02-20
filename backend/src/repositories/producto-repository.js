const { prisma } = require("../db/prisma");

const productoRepository = {
  findAll: () => prisma.producto.findMany({ orderBy: { createdAt: "desc" } }),

  findById: (id) => prisma.producto.findUnique({ where: { id } }),

  findBySku: (sku) => prisma.producto.findUnique({ where: { sku } }),

  create: (data) => prisma.producto.create({ data }),

  update: (id, data) => prisma.producto.update({ where: { id }, data }),

  remove: (id) => prisma.producto.delete({ where: { id } }),
};

module.exports = { productoRepository };