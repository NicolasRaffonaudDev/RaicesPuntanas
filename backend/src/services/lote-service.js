const { AppError } = require("../utils/app-error");
const { loteRepository } = require("../repositories/lote-repository");
const { auditService } = require("./audit-service");

const normalizePayload = (data) => ({
  ...data,
  amenities: data.amenities ?? [],
  description: data.description || null,
});

const loteService = {
  list: async () => loteRepository.findAll(),

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
