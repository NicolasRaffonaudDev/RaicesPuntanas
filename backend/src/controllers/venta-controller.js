const { ventaService } = require("../services/venta-service");

const ventaController = {
  list: async (req, res) => {
    const data = await ventaService.list({ userRole: req.auth.role, userId: req.auth.sub });
    res.json({ data });
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