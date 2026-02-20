const { userRepository } = require("../repositories/user-repository");

const userController = {
  list: async (req, res) => {
    const data = await userRepository.findAllSafe();
    res.json({ data });
  },
};

module.exports = { userController };
