const { userService } = require("../services/user-service");
const { parsePagination } = require("../utils/query");

const userController = {
  list: async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const search = req.query.search ? String(req.query.search).trim() : "";
    const result = await userService.list({ page, limit, skip, search });
    res.json(result);
  },

  updateRole: async (req, res) => {
    const data = await userService.updateRole({
      actorUserId: req.auth.sub,
      targetUserId: req.params.id,
      role: req.body.role,
    });
    res.json({ data });
  },
};

module.exports = { userController };
