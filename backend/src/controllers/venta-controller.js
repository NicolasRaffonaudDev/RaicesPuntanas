const { ventaService } = require("../services/venta-service");
const { parseDateRange, parsePagination } = require("../utils/query");

const ventaController = {
  list: async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const { from, to } = parseDateRange(req.query);
    const search = req.query.search ? String(req.query.search).trim() : "";

    const result = await ventaService.list({
      userRole: req.auth.role,
      userId: req.auth.sub,
      search,
      from,
      to,
      page,
      limit,
      skip,
    });

    res.json(result);
  },

  create: async (req, res) => {
    const data = await ventaService.create({
      actorUserId: req.auth.sub,
      clienteId: req.body.clienteId,
      items: req.body.items,
    });
    res.status(201).json({ data });
  },
};

module.exports = { ventaController };
