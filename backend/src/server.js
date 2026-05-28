require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { app } = require("./app");
const { env } = require("./config");
const { setIO } = require("./config/socket");
const { prisma } = require("./db/prisma");
const { UPLOADS_ROOT_DIR } = require("./config/multer");

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: env.FRONTEND_ORIGINS,
    credentials: true,
  },
});

setIO(io);

io.on("connection", (socket) => {
  socket.emit("system", { message: "Conectado a notificaciones de Raices Puntanas" });
});

const start = async () => {
  console.log("[boot] starting api");
  console.log(`[boot] runtime node=${process.version} env=${env.NODE_ENV} port=${env.PORT}`);
  console.log(`[boot] frontend_origins=${env.FRONTEND_ORIGINS.join("|")}`);
  console.log("[boot] checking uploads dir");

  try {
    fs.accessSync(path.resolve(UPLOADS_ROOT_DIR), fs.constants.R_OK | fs.constants.W_OK);
    console.log(`[boot] uploads dir ok path=${UPLOADS_ROOT_DIR}`);
  } catch (error) {
    console.warn(`[boot:error] uploads dir check failed path=${UPLOADS_ROOT_DIR} reason=${error.message}`);
  }

  console.log("[boot] connecting database");
  await prisma.$connect();
  console.log("[boot] database connected");

  console.log("[boot] starting http server");
  httpServer.listen(env.PORT, () => {
    console.log(`[boot] api listening on :${env.PORT}`);
  });
};

start().catch(async (error) => {
  console.error("[boot:error] startup failed", error);
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

process.on("unhandledRejection", (reason) => {
  console.error("[boot:error] unhandledRejection", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[boot:error] uncaughtException", error);
  process.exit(1);
});
