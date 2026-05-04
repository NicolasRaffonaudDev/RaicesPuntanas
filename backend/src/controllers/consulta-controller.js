const { consultaService } = require("../services/consulta-service");
const { parsePagination } = require("../utils/query");

const consultaController = {
  create: async (req, res) => {
    const data = await consultaService.create({ userId: req.auth.sub, data: req.body });
    res.status(201).json({ data });
  },

  createPublic: async (req, res) => {
    const data = await consultaService.createPublic({ data: req.body });
    res.status(201).json({ data });
  },

  listMine: async (req, res) => {
    const data = await consultaService.listMine({ userId: req.auth.sub });
    res.json({ data });
  },

  listAll: async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const q = req.query.q
      ? String(req.query.q).trim()
      : req.query.search
        ? String(req.query.search).trim()
        : "";
    const estado = req.query.estado ? String(req.query.estado).trim() : "";
    const rawOrigen = req.query.origen ? String(req.query.origen).trim() : "";
    const origen = rawOrigen === "user" || rawOrigen === "public_form" ? rawOrigen : "";
    const rawLoteId = req.query.loteId ? Number(req.query.loteId) : NaN;
    const loteId = Number.isFinite(rawLoteId) && rawLoteId > 0 ? rawLoteId : undefined;
    const result = await consultaService.listAll({ page, limit, skip, q, estado, origen, loteId });
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

  updateEstadoMany: async (req, res) => {
    const data = await consultaService.updateEstadoMany({
      actorUserId: req.auth.sub,
      ids: req.body.ids,
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
