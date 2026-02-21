const { favoritoService } = require("../services/favorito-service");
const { AppError } = require("../utils/app-error");

const parseLoteId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, "ID de lote invalido");
  return id;
};

const favoritoController = {
  listMine: async (req, res) => {
    const data = await favoritoService.listMine({ userId: req.auth.sub });
    res.json({ data });
  },

  add: async (req, res) => {
    const loteId = parseLoteId(req.params.loteId);
    const data = await favoritoService.add({ userId: req.auth.sub, loteId });
    res.status(201).json({ data });
  },

  remove: async (req, res) => {
    const loteId = parseLoteId(req.params.loteId);
    await favoritoService.remove({ userId: req.auth.sub, loteId });
    res.status(204).send();
  },
};

module.exports = { favoritoController };