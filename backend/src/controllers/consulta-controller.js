const { consultaService } = require("../services/consulta-service");
const { parsePagination } = require("../utils/query");

const consultaController = {
  create: async (req, res) => {
    const data = await consultaService.create({ userId: req.auth.sub, data: req.body });
    res.status(201).json({ data });
  },

  listMine: async (req, res) => {
    const data = await consultaService.listMine({ userId: req.auth.sub });
    res.json({ data });
  },

  listAll: async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const search = req.query.search ? String(req.query.search).trim() : "";
    const estado = req.query.estado ? String(req.query.estado).trim() : "";
    const result = await consultaService.listAll({ page, limit, skip, search, estado });
    res.json(result);
  },

  updateEstado: async (req, res) => {
    const data = await consultaService.updateEstado({
      actorUserId: req.auth.sub,
      id: req.params.id,
      estado: req.body.estado,
    });
    res.json({ data });
  },

  listSeguimientos: async (req, res) => {
    const data = await consultaService.listSeguimientos({
      consultaId: req.params.id,
      actorUserId: req.auth.sub,
      actorRole: req.auth.role,
    });
    res.json({ data });
  },

  addSeguimiento: async (req, res) => {
    const data = await consultaService.addSeguimiento({
      consultaId: req.params.id,
      actorUserId: req.auth.sub,
      mensaje: req.body.mensaje,
      esInterno: req.body.esInterno ?? true,
    });
    res.status(201).json({ data });
  },
};

module.exports = { consultaController };
