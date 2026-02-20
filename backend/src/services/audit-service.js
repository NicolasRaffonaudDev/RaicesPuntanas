const { auditRepository } = require("../repositories/audit-repository");
const { getIO } = require("../config/socket");

const auditService = {
  create: async ({ userId, action, meta = {} }) => {
    const entry = await auditRepository.create({ userId, action, meta });
    const io = getIO();
    if (io) io.emit("audit:created", entry);
    return entry;
  },

  getRecent: async (limit = 200) => auditRepository.findRecent(limit),
};

module.exports = { auditService };
