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
      const uploadedImages = Array.isArray(data.uploadedImages) ? data.uploadedImages : [];
      const { uploadedImages: _uploadedImages, ...loteData } = data;
      const created = await tx.lote.create({ data: loteData });

      const imageUrls = uploadedImages.length > 0 ? uploadedImages : data.image ? [data.image] : [];
      if (imageUrls.length > 0) {
        await tx.loteImagen.createMany({
          data: imageUrls.map((url, index) => ({ loteId: created.id, url, orden: index })),
        });
      }

      return tx.lote.findUnique({ where: { id: created.id }, include: loteInclude });
    }),

  update: (id, data) =>
    prisma.$transaction(async (tx) => {
      const uploadedImages = Array.isArray(data.uploadedImages) ? data.uploadedImages : [];
      const { uploadedImages: _uploadedImages, ...loteData } = data;
      await tx.lote.update({ where: { id }, data: loteData });

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

      if (uploadedImages.length > 0) {
        const currentMaxOrder = await tx.loteImagen.aggregate({
          where: { loteId: id },
          _max: { orden: true },
        });
        let nextOrder = (currentMaxOrder._max.orden ?? -1) + 1;
        await tx.loteImagen.createMany({
          data: uploadedImages.map((url) => {
            const current = { loteId: id, url, orden: nextOrder };
            nextOrder += 1;
            return current;
          }),
        });
      }

      return tx.lote.findUnique({ where: { id }, include: loteInclude });
    }),

  findImageById: (loteId, imageId) =>
    prisma.loteImagen.findFirst({
      where: { id: imageId, loteId },
    }),

  markImageAsPrimary: (loteId, imageId) =>
    prisma.$transaction(async (tx) => {
      const allImages = await tx.loteImagen.findMany({
        where: { loteId },
        orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
      });
      const target = allImages.find((img) => img.id === imageId);
      if (!target) return null;

      const ordered = [target, ...allImages.filter((img) => img.id !== imageId)];
      for (let index = 0; index < ordered.length; index += 1) {
        await tx.loteImagen.update({
          where: { id: ordered[index].id },
          data: { orden: index },
        });
      }

      await tx.lote.update({
        where: { id: loteId },
        data: { image: target.url },
      });

      return tx.lote.findUnique({ where: { id: loteId }, include: loteInclude });
    }),

  removeImage: (loteId, imageId) =>
    prisma.$transaction(async (tx) => {
      const image = await tx.loteImagen.findFirst({ where: { id: imageId, loteId } });
      if (!image) return null;

      await tx.loteImagen.delete({ where: { id: imageId } });

      const remaining = await tx.loteImagen.findMany({
        where: { loteId },
        orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
      });

      for (let index = 0; index < remaining.length; index += 1) {
        if (remaining[index].orden !== index) {
          await tx.loteImagen.update({
            where: { id: remaining[index].id },
            data: { orden: index },
          });
        }
      }

      const nextPrimary = remaining[0]?.url ?? "";
      await tx.lote.update({
        where: { id: loteId },
        data: { image: nextPrimary },
      });

      return {
        removed: image,
        lote: await tx.lote.findUnique({ where: { id: loteId }, include: loteInclude }),
      };
    }),

  remove: (id) => prisma.lote.delete({ where: { id } }),
};

module.exports = { loteRepository };
