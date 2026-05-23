const { AppError } = require("../utils/app-error");
const { loteRepository } = require("../repositories/lote-repository");
const { deleteLocalLoteImage, getAbsolutePathFromPublicUpload, isLocalLoteImagePath } = require("../utils/upload-storage");
const { auditService } = require("./audit-service");
const fs = require("node:fs/promises");

const buildAmenitiesForCreate = (amenityIds = []) => {
  if (!Array.isArray(amenityIds) || amenityIds.length === 0) return undefined;
  return { connect: amenityIds.map((id) => ({ id })) };
};

const buildAmenitiesForUpdate = (amenityIds) => {
  if (!Array.isArray(amenityIds)) return undefined;
  return { set: amenityIds.map((id) => ({ id })) };
};

const buildCreatePayload = (data) => {
  const { amenities, uploadedImages, ...rest } = data;
  const normalizedUploadedImages = Array.isArray(uploadedImages)
    ? uploadedImages.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const imageFromPayload = normalizedUploadedImages[0] || rest.image;
  return {
    ...rest,
    image: imageFromPayload || "",
    uploadedImages: normalizedUploadedImages,
    amenities: buildAmenitiesForCreate(amenities),
    address: data.address || null,
    description: data.description || null,
  };
};

const buildUpdatePayload = (data) => {
  const { amenities, uploadedImages, ...rest } = data;
  const normalizedUploadedImages = Array.isArray(uploadedImages)
    ? uploadedImages.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const imageFromPayload = normalizedUploadedImages[0] || rest.image;
  return {
    ...rest,
    image: imageFromPayload,
    uploadedImages: normalizedUploadedImages,
    amenities: buildAmenitiesForUpdate(amenities),
    address: data.address === undefined ? undefined : data.address || null,
    description: data.description === undefined ? undefined : data.description || null,
  };
};

const collectLocalLoteImagePaths = (lote) => {
  const imagePaths = new Set();

  if (isLocalLoteImagePath(lote?.image)) {
    imagePaths.add(lote.image);
  }

  lote?.imagenes?.forEach((image) => {
    if (isLocalLoteImagePath(image?.url)) {
      imagePaths.add(image.url);
    }
  });

  return Array.from(imagePaths);
};

const localImageExists = async (imagePath) => {
  if (!isLocalLoteImagePath(imagePath)) return true;
  const absolutePath = getAbsolutePathFromPublicUpload(imagePath);
  if (!absolutePath) return false;

  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
};

const normalizeLoteImagesForResponse = async (lote) => {
  if (!lote) return lote;

  const nextLote = {
    ...lote,
    imagenes: Array.isArray(lote.imagenes) ? [...lote.imagenes] : [],
  };

  if (!(await localImageExists(nextLote.image))) {
    nextLote.image = "";
  }

  nextLote.imagenes = await Promise.all(
    nextLote.imagenes.map(async (img) => {
      if (!img?.url) return img;
      if (await localImageExists(img.url)) return img;
      return { ...img, url: "" };
    }),
  );

  return nextLote;
};

const normalizeManyLotesImagesForResponse = async (lotes) =>
  Promise.all((lotes || []).map((lote) => normalizeLoteImagesForResponse(lote)));

const loteService = {
  list: async ({ page, limit, minPrice, amenities, sort, q }) => {
    const where = {};
    const andConditions = [];
    if (typeof minPrice === "number") {
      andConditions.push({ price: { gte: minPrice } });
    }
    if (amenities && amenities.length > 0) {
      andConditions.push(...amenities.map((id) => ({ amenities: { some: { id } } })));
    }
    if (q) {
      andConditions.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { address: { contains: q, mode: "insensitive" } },
        ],
      });
    }
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    let orderBy = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "size_desc") orderBy = { size: "desc" };

    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      loteRepository.findPaged({ where, orderBy, skip, take }),
      loteRepository.count(where),
    ]);

    return {
      data: await normalizeManyLotesImagesForResponse(data),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  getByIds: async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    const lotes = await loteRepository.findByIds(ids);
    return normalizeManyLotesImagesForResponse(lotes);
  },

  getById: async (id) => {
    const lote = await loteRepository.findById(id);
    if (!lote) throw new AppError(404, "Lote no encontrado");
    return normalizeLoteImagesForResponse(lote);
  },

  getFilters: async () => {
    const amenities = await loteRepository.getAllAmenities();
    return { amenities };
  },

  create: async ({ actorUserId, data }) => {
    const uploadedImages = Array.isArray(data.uploadedImages) ? data.uploadedImages : [];
    try {
      const created = await loteRepository.create(buildCreatePayload(data));
      await auditService.create({ userId: actorUserId, action: "lote.create", meta: { loteId: created.id } });
      return normalizeLoteImagesForResponse(created);
    } catch (error) {
      for (const imagePath of uploadedImages) {
        if (isLocalLoteImagePath(imagePath)) {
          await deleteLocalLoteImage(imagePath);
        }
      }
      throw error;
    }
  },

  update: async ({ actorUserId, id, data }) => {
    const existing = await loteRepository.findById(id);
    if (!existing) {
      const uploadedImages = Array.isArray(data.uploadedImages) ? data.uploadedImages : [];
      for (const imagePath of uploadedImages) {
        if (isLocalLoteImagePath(imagePath)) {
          await deleteLocalLoteImage(imagePath);
        }
      }
      throw new AppError(404, "Lote no encontrado");
    }

    const previousImage = existing.image;
    const uploadedImages = Array.isArray(data.uploadedImages) ? data.uploadedImages : [];

    try {
      const updated = await loteRepository.update(id, buildUpdatePayload(data));
      await auditService.create({ userId: actorUserId, action: "lote.update", meta: { loteId: id } });

      if (data.image && data.image !== previousImage && isLocalLoteImagePath(previousImage)) {
        await deleteLocalLoteImage(previousImage);
      }

      return normalizeLoteImagesForResponse(updated);
    } catch (error) {
      for (const imagePath of uploadedImages) {
        if (isLocalLoteImagePath(imagePath)) {
          await deleteLocalLoteImage(imagePath);
        }
      }
      throw error;
    }
  },

  remove: async ({ actorUserId, id }) => {
    const existing = await loteRepository.findById(id);
    if (!existing) throw new AppError(404, "Lote no encontrado");
    const localImagePaths = collectLocalLoteImagePaths(existing);

    await loteRepository.remove(id);
    await auditService.create({ userId: actorUserId, action: "lote.delete", meta: { loteId: id } });
    for (const imagePath of localImagePaths) {
      await deleteLocalLoteImage(imagePath);
    }
  },

  removeImage: async ({ actorUserId, loteId, imageId }) => {
    const lote = await loteRepository.findById(loteId);
    if (!lote) throw new AppError(404, "Lote no encontrado");

    const result = await loteRepository.removeImage(loteId, imageId);
    if (!result) throw new AppError(404, "Imagen no encontrada");

    if (isLocalLoteImagePath(result.removed.url)) {
      await deleteLocalLoteImage(result.removed.url);
    }

    await auditService.create({
      userId: actorUserId,
      action: "lote.image.delete",
      meta: { loteId, imageId },
    });

    return normalizeLoteImagesForResponse(result.lote);
  },

  setPrimaryImage: async ({ actorUserId, loteId, imageId }) => {
    const lote = await loteRepository.findById(loteId);
    if (!lote) throw new AppError(404, "Lote no encontrado");

    const updated = await loteRepository.markImageAsPrimary(loteId, imageId);
    if (!updated) throw new AppError(404, "Imagen no encontrada");

    await auditService.create({
      userId: actorUserId,
      action: "lote.image.primary",
      meta: { loteId, imageId },
    });

    return normalizeLoteImagesForResponse(updated);
  },
};

module.exports = { loteService };
