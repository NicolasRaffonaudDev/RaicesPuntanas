const { inventarioService } = require("../services/inventario-service");

const inventarioController = {
  list: async (req, res) => {
    const data = await inventarioService.listMovements();
    res.json({ data });
  },

  createMovement: async (req, res) => {
    const data = await inventarioService.createMovement({ actorUserId: req.auth.sub, data: req.body });
    res.status(201).json({ data });
  },
};

module.exports = { inventarioController };