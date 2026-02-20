const { productoService } = require("../services/producto-service");
const { AppError } = require("../utils/app-error");
const { parsePagination } = require("../utils/query");

const parseId = (rawId) => {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, "ID de producto invalido");
  return id;
};

const productoController = {
  list: async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const search = req.query.search ? String(req.query.search).trim() : "";
    const onlyActive = req.query.onlyActive === "true";
    const lowStock = req.query.lowStock === "true";
    const result = await productoService.list({ search, onlyActive, lowStock, page, limit, skip });
    res.json(result);
  },

  create: async (req, res) => {
    const data = await productoService.create({ actorUserId: req.auth.sub, data: req.body });
    res.status(201).json({ data });
  },

  update: async (req, res) => {
    const data = await productoService.update({
      actorUserId: req.auth.sub,
      id: parseId(req.params.id),
      data: req.body,
    });
    res.json({ data });
  },

  remove: async (req, res) => {
    await productoService.remove({ actorUserId: req.auth.sub, id: parseId(req.params.id) });
    res.status(204).send();
  },
};

module.exports = { productoController };
