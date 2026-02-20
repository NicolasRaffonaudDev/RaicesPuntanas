const { AppError } = require("../utils/app-error");
const { clienteRepository } = require("../repositories/cliente-repository");
const { auditService } = require("./audit-service");

const clienteService = {
  list: async () => clienteRepository.findAll(),

  create: async ({ actorUserId, data }) => {
    if (data.email) {
      const existing = await clienteRepository.findByEmail(data.email.toLowerCase());
      if (existing) throw new AppError(409, "Ya existe un cliente con ese email");
      data.email = data.email.toLowerCase();
    }

    const created = await clienteRepository.create(data);
    await auditService.create({ userId: actorUserId, action: "cliente.create", meta: { clienteId: created.id } });
    return created;
  },

  update: async ({ actorUserId, id, data }) => {
    const existing = await clienteRepository.findById(id);
    if (!existing) throw new AppError(404, "Cliente no encontrado");

    if (data.email) {
      const email = data.email.toLowerCase();
      const foundByEmail = await clienteRepository.findByEmail(email);
      if (foundByEmail && foundByEmail.id !== id) {
        throw new AppError(409, "Ya existe un cliente con ese email");
      }
      data.email = email;
    }

    const updated = await clienteRepository.update(id, data);
    await auditService.create({ userId: actorUserId, action: "cliente.update", meta: { clienteId: id } });
    return updated;
  },

  remove: async ({ actorUserId, id }) => {
    const existing = await clienteRepository.findById(id);
    if (!existing) throw new AppError(404, "Cliente no encontrado");

    await clienteRepository.remove(id);
    await auditService.create({ userId: actorUserId, action: "cliente.delete", meta: { clienteId: id } });
  },
};

module.exports = { clienteService };