const { AppError } = require("../utils/app-error");
const { loteRepository } = require("../repositories/lote-repository");
const { auditService } = require("./audit-service");

const buildAmenitiesForCreate = (amenityIds = []) => {
  if (!Array.isArray(amenityIds) || amenityIds.length === 0) return undefined;
  return { connect: amenityIds.map((id) => ({ id })) };
};

const buildAmenitiesForUpdate = (amenityIds) => {
  if (!Array.isArray(amenityIds)) return undefined;
  return { set: amenityIds.map((id) => ({ id })) };
};

const buildCreatePayload = (data) => {
  const { amenities, ...rest } = data;
  return {
    ...rest,
    amenities: buildAmenitiesForCreate(amenities),
    address: data.address || null,
    description: data.description || null,
  };
};

const buildUpdatePayload = (data) => {
  const { amenities, ...rest } = data;
  return {
    ...rest,
    amenities: buildAmenitiesForUpdate(amenities),
    address: data.address === undefined ? undefined : data.address || null,
    description: data.description === undefined ? undefined : data.description || null,
  };
};

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
      data,
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
    return loteRepository.findByIds(ids);
  },

  getFilters: async () => {
    const amenities = await loteRepository.getAllAmenities();
    return { amenities };
  },

  create: async ({ actorUserId, data }) => {
    const created = await loteRepository.create(buildCreatePayload(data));
    await auditService.create({ userId: actorUserId, action: "lote.create", meta: { loteId: created.id } });
    return created;
  },

  update: async ({ actorUserId, id, data }) => {
    const existing = await loteRepository.findById(id);
    if (!existing) throw new AppError(404, "Lote no encontrado");

    const updated = await loteRepository.update(id, buildUpdatePayload(data));
    await auditService.create({ userId: actorUserId, action: "lote.update", meta: { loteId: id } });
    return updated;
  },

  remove: async ({ actorUserId, id }) => {
    const existing = await loteRepository.findById(id);
    if (!existing) throw new AppError(404, "Lote no encontrado");

    await loteRepository.remove(id);
    await auditService.create({ userId: actorUserId, action: "lote.delete", meta: { loteId: id } });
  },
};

module.exports = { loteService };
