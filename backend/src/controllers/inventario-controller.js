const { inventarioService } = require("../services/inventario-service");
const { parseDateRange, parsePagination } = require("../utils/query");

const inventarioController = {
  list: async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const { from, to } = parseDateRange(req.query);
    const tipo = req.query.tipo ? String(req.query.tipo) : "";

    const result = await inventarioService.listMovements({
      tipo: ["entrada", "salida", "ajuste"].includes(tipo) ? tipo : "",
      from,
      to,
      page,
      limit,
      skip,
    });

    res.json(result);
  },

  createMovement: async (req, res) => {
    const data = await inventarioService.createMovement({ actorUserId: req.auth.sub, data: req.body });
    res.status(201).json({ data });
  },
};

module.exports = { inventarioController };
