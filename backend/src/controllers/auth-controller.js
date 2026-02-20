const { authService } = require("../services/auth-service");

const authController = {
  register: async (req, res) => {
    const data = await authService.register(req.body);
    res.status(201).json(data);
  },

  login: async (req, res) => {
    const data = await authService.login(req.body);
    res.json(data);
  },

  passwordReset: async (req, res) => {
    const data = await authService.requestPasswordReset(req.body);
    res.json(data);
  },

  setupAdmin: async (req, res) => {
    const data = await authService.setupAdmin(req.body);
    res.status(201).json(data);
  },
};

module.exports = { authController };
