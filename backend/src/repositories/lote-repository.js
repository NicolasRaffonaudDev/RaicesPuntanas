const { prisma } = require("../db/prisma");

const loteInclude = { amenities: true };

const loteRepository = {
  findAll: () =>
    prisma.lote.findMany({
      orderBy: { createdAt: "desc" },
      include: loteInclude,
    }),

  findPaged: ({ where, orderBy, skip, take }) =>
    prisma.lote.findMany({
      where,
      orderBy,
      skip,
      take,
      include: loteInclude,
    }),

  count: (where) => prisma.lote.count({ where }),

  findByIds: (ids) =>
    prisma.lote.findMany({
      where: { id: { in: ids } },
      include: loteInclude,
    }),

  getAllAmenities: () =>
    prisma.amenity.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),

  findById: (id) => prisma.lote.findUnique({ where: { id }, include: loteInclude }),

  create: (data) => prisma.lote.create({ data, include: loteInclude }),

  update: (id, data) => prisma.lote.update({ where: { id }, data, include: loteInclude }),

  remove: (id) => prisma.lote.delete({ where: { id } }),
};

module.exports = { loteRepository };
