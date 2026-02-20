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

  refresh: async (req, res) => {
    const data = await authService.refreshSession(req.body);
    res.json(data);
  },

  logout: async (req, res) => {
    const data = await authService.logout(req.body);
    res.json(data);
  },

  logoutAll: async (req, res) => {
    const data = await authService.logoutAll({ userId: req.auth.sub });
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
