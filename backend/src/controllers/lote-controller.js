const { loteService } = require("../services/lote-service");
const { AppError } = require("../utils/app-error");

const parseId = (rawId) => {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, "ID de lote invalido");
  return id;
};

const loteController = {
  getAll: async (req, res) => {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limitRaw = Number.parseInt(req.query.limit, 10) || 10;
    const limit = Math.min(Math.max(limitRaw, 1), 100);

    const minPriceRaw = req.query.minPrice;
    const minPriceNumber = minPriceRaw !== undefined ? Number(minPriceRaw) : null;
    const minPrice = Number.isFinite(minPriceNumber) ? minPriceNumber : undefined;

    const amenitiesRaw = req.query.amenities ? String(req.query.amenities) : "";
    const amenities = amenitiesRaw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const sort = ["price_asc", "price_desc", "size_desc"].includes(String(req.query.sort))
      ? String(req.query.sort)
      : undefined;

    const result = await loteService.list({
      page,
      limit,
      minPrice,
      amenities,
      sort,
    });

    res.json(result);
  },

  getByIds: async (req, res) => {
    const idsRaw = req.query.ids;
    if (!idsRaw) {
      res.json([]);
      return;
    }

    const ids = String(idsRaw)
      .split(",")
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id));

    const data = await loteService.getByIds(ids);
    res.json(data);
  },

  create: async (req, res) => {
    const data = await loteService.create({ actorUserId: req.auth.sub, data: req.body });
    res.status(201).json({ data });
  },

  update: async (req, res) => {
    const data = await loteService.update({
      actorUserId: req.auth.sub,
      id: parseId(req.params.id),
      data: req.body,
    });
    res.json({ data });
  },

  remove: async (req, res) => {
    await loteService.remove({
      actorUserId: req.auth.sub,
      id: parseId(req.params.id),
    });
    res.status(204).send();
  },
};

module.exports = { loteController };
