const app = require("./app");
const mongoose = require("mongoose");
const connectToDatabase = require("./config/db");
const { getPoolStatus } = require("./config/db");
const env = require("./config/env");
const logger = require("./config/logger");

let server = null;
let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) {
    logger.warn("Graceful shutdown already in progress", { signal });
    return;
  }

  isShuttingDown = true;
  logger.warn(`Received ${signal}, starting graceful shutdown...`);

  const finalPoolStatus = getPoolStatus();
  logger.info("Final connection pool status", finalPoolStatus);

  const shutdownTimeout = setTimeout(() => {
    logger.error("Forced shutdown due to timeout");
    process.exit(1);
  }, 10000);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      logger.info("HTTP server closed");
    }

    if (mongoose.connection.readyState === 1) {
      logger.info("Waiting for pending database operations to complete...");
      await mongoose.disconnect();
      logger.info("Database connection pool drained and closed");
    }

    clearTimeout(shutdownTimeout);
    logger.info("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during graceful shutdown", { error: error.message });
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    await connectToDatabase();

    const initialPoolStatus = getPoolStatus();
    logger.info("Initial connection pool status", initialPoolStatus);

    server = app.listen(env.port, () => {
      logger.info("Server running", {
        port: env.port,
        envPath: env.envPath,
        poolConfig: {
          maxSize: env.dbPoolMaxSize,
          minSize: env.dbPoolMinSize,
        },
      });
    });

    server.on("error", (error) => {
      logger.error("Server error", { error: error.message });
      gracefulShutdown("SERVER_ERROR");
    });

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception", { error: error.message, stack: error.stack });
      gracefulShutdown("UNCAUGHT_EXCEPTION");
    });

    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled Rejection", {
        reason: reason?.message || reason,
        stack: reason?.stack,
      });

      if (env.nodeEnv === "production") {
        gracefulShutdown("UNHANDLED_REJECTION");
        return;
      }

      logger.warn("Unhandled rejection ignored in non-production mode");
    });

    if (app.get("env") !== "production") {
      app.get("/db-pool-status", (req, res) => {
        res.json(getPoolStatus());
      });
    }
  } catch (error) {
    logger.error("Failed to start server", {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

startServer();
