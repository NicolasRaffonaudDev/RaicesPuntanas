const { AppError } = require("../utils/app-error");
const { loteRepository } = require("../repositories/lote-repository");
const { auditService } = require("./audit-service");

const normalizePayload = (data) => ({
  ...data,
  amenities: data.amenities ?? [],
  description: data.description || null,
});

const loteService = {
  list: async ({ page, limit, minPrice, amenities, sort }) => {
    const where = {};
    if (typeof minPrice === "number") {
      where.price = { gte: minPrice };
    }
    if (amenities && amenities.length > 0) {
      where.amenities = { hasEvery: amenities };
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

  create: async ({ actorUserId, data }) => {
    const created = await loteRepository.create(normalizePayload(data));
    await auditService.create({ userId: actorUserId, action: "lote.create", meta: { loteId: created.id } });
    return created;
  },

  update: async ({ actorUserId, id, data }) => {
    const existing = await loteRepository.findById(id);
    if (!existing) throw new AppError(404, "Lote no encontrado");

    const updated = await loteRepository.update(id, normalizePayload(data));
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
