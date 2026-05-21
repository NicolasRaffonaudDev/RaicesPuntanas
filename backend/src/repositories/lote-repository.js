const { prisma } = require("../db/prisma");

const loteInclude = {
  amenities: true,
  imagenes: {
    orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
  },
};

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

  create: (data) =>
    prisma.$transaction(async (tx) => {
      const created = await tx.lote.create({ data });

      if (data.image) {
        await tx.loteImagen.upsert({
          where: {
            loteId_orden: {
              loteId: created.id,
              orden: 0,
            },
          },
          update: { url: data.image },
          create: {
            loteId: created.id,
            url: data.image,
            orden: 0,
          },
        });
      }

      return tx.lote.findUnique({ where: { id: created.id }, include: loteInclude });
    }),

  update: (id, data) =>
    prisma.$transaction(async (tx) => {
      await tx.lote.update({ where: { id }, data });

      if (data.image !== undefined) {
        await tx.loteImagen.upsert({
          where: {
            loteId_orden: {
              loteId: id,
              orden: 0,
            },
          },
          update: { url: data.image },
          create: {
            loteId: id,
            url: data.image,
            orden: 0,
          },
        });
      }

      return tx.lote.findUnique({ where: { id }, include: loteInclude });
    }),

  remove: (id) => prisma.lote.delete({ where: { id } }),
};

module.exports = { loteRepository };
