const { clienteService } = require("../services/cliente-service");
const { parsePagination } = require("../utils/query");

const clienteController = {
  list: async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const search = req.query.search ? String(req.query.search).trim() : "";
    const result = await clienteService.list({
      actorRole: req.auth.role,
      actorUserId: req.auth.sub,
      search,
      page,
      limit,
      skip,
    });
    res.json(result);
  },

  create: async (req, res) => {
    const data = await clienteService.create({ actorUserId: req.auth.sub, data: req.body });
    res.status(201).json({ data });
  },

  update: async (req, res) => {
    const data = await clienteService.update({
      actorUserId: req.auth.sub,
      actorRole: req.auth.role,
      id: req.params.id,
      data: req.body,
    });
    res.json({ data });
  },

  remove: async (req, res) => {
    await clienteService.remove({ actorUserId: req.auth.sub, actorRole: req.auth.role, id: req.params.id });
    res.status(204).send();
  },
};

module.exports = { clienteController };