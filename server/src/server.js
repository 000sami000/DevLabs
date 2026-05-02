const app = require("./app");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { getPoolStatus } = require("./config/db");
const env = require("./config/env");
const logger = require("./config/logger");

let server;
let shuttingDown = false;

async function gracefulShutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.warn(`Shutting down (${signal})...`);
  logger.info("Pool status:", getPoolStatus());

  const timeout = setTimeout(() => {
    logger.error("Forced shutdown");
    process.exit(1);
  }, 10000);

  try {
    if (server) await new Promise(res => server.close(res));
    if (mongoose.connection.readyState === 1) await mongoose.disconnect();

    clearTimeout(timeout);
    logger.info("Shutdown complete");
    process.exit(0);
  } catch (err) {
    logger.error("Shutdown error:", err.message);
    process.exit(1);
  }
}

async function start() {
  try {
    await connectDB();

    logger.info("DB connected:", getPoolStatus());

    server = app.listen(env.port, () => {
      logger.info(`Server running on port ${env.port}`);
    });

    server.on("error", () => gracefulShutdown("SERVER_ERROR"));

    ["SIGINT", "SIGTERM"].forEach(sig =>
      process.on(sig, () => gracefulShutdown(sig))
    );

    process.on("uncaughtException", err => {
      logger.error("Uncaught:", err);
      gracefulShutdown("UNCAUGHT_EXCEPTION");
    });

    process.on("unhandledRejection", err => {
      logger.error("Unhandled:", err);
      if (env.nodeEnv === "production") {
        gracefulShutdown("UNHANDLED_REJECTION");
      }
    });

  } catch (err) {
    logger.error("Startup failed:", err);
    process.exit(1);
  }
}

start();