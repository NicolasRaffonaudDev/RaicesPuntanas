let io = null;

const setIO = (socketServer) => {
  io = socketServer;
};

const getIO = () => io;

module.exports = { setIO, getIO };
