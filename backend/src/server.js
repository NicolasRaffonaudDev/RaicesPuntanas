require("dotenv").config();
const { createServer } = require("http");
const { Server } = require("socket.io");
const { app } = require("./app");
const { env } = require("./config/env");
const { setIO } = require("./config/socket");
const { prisma } = require("./db/prisma");

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: env.FRONTEND_ORIGIN,
  },
});

setIO(io);

io.on("connection", (socket) => {
  socket.emit("system", { message: "Conectado a notificaciones de Raices Puntanas" });
});

const start = async () => {
  await prisma.$connect();
  httpServer.listen(env.PORT, () => {
    console.log(`Raices Puntanas API en http://localhost:${env.PORT}`);
  });
};

start().catch(async (error) => {
  console.error("No fue posible iniciar el servidor", error);
  await prisma.$disconnect();
  process.exit(1);
});

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
