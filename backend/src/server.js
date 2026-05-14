require("dotenv").config();
const { createServer } = require("http");
const { Server } = require("socket.io");
const { app } = require("./app");
const { env } = require("./config");
const { setIO } = require("./config/socket");
const { prisma } = require("./db/prisma");

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
  },
});

setIO(io);

io.on("connection", (socket) => {
  socket.emit("system", { message: "Conectado a notificaciones de Raices Puntanas" });
});

const start = async () => {
  await prisma.$connect();
  console.log(
    `[startup] db=connected env=${env.NODE_ENV} port=${env.PORT} frontend_origin=${env.FRONTEND_ORIGIN}`,
  );
  httpServer.listen(env.PORT, () => {
    console.log(`[startup] api=listening url=http://localhost:${env.PORT}`);
  });
};

start().catch(async (error) => {
  console.error("[startup] failed", error);
  await prisma.$disconnect();
  process.exit(1);
});

const shutdown = async () => {
  console.log("[shutdown] closing prisma connection");
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
