const { clienteService } = require("../services/cliente-service");

const clienteController = {
  list: async (req, res) => {
    const data = await clienteService.list();
    res.json({ data });
  },

  create: async (req, res) => {
    const data = await clienteService.create({ actorUserId: req.auth.sub, data: req.body });
    res.status(201).json({ data });
  },

  update: async (req, res) => {
    const data = await clienteService.update({
      actorUserId: req.auth.sub,
      id: req.params.id,
      data: req.body,
    });
    res.json({ data });
  },

  remove: async (req, res) => {
    await clienteService.remove({ actorUserId: req.auth.sub, id: req.params.id });
    res.status(204).send();
  },
};

module.exports = { clienteController };