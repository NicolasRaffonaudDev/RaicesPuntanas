const { loteService } = require("../services/lote-service");
const { AppError } = require("../utils/app-error");

const parseId = (rawId) => {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, "ID de lote invalido");
  return id;
};

const loteController = {
  getAll: async (req, res) => {
    const data = await loteService.list();
    res.json(data);
  },

  create: async (req, res) => {
    const data = await loteService.create({ actorUserId: req.auth.sub, data: req.body });
    res.status(201).json({ data });
  },

  update: async (req, res) => {
    const data = await loteService.update({
      actorUserId: req.auth.sub,
      id: parseId(req.params.id),
      data: req.body,
    });
    res.json({ data });
  },

  remove: async (req, res) => {
    await loteService.remove({
      actorUserId: req.auth.sub,
      id: parseId(req.params.id),
    });
    res.status(204).send();
  },
};

module.exports = { loteController };
