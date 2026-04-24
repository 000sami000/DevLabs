const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const rootEnvPath = path.resolve(__dirname, "../../../.env");
const serverEnvPath = path.resolve(__dirname, "../../.env");
const envPath = fs.existsSync(rootEnvPath) ? rootEnvPath : serverEnvPath;

dotenv.config({ path: envPath });

const corsOrigins = (process.env.CORS_ORIGINS || process.env.ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  origin: process.env.ORIGIN || "http://localhost:5173",
  corsOrigins,
  mongoUri:
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/DevLabs",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  minio: {
    endPoint: process.env.MINIO_ENDPOINT || "127.0.0.1",
    port: Number(process.env.MINIO_PORT || 9000),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY || "",
    secretKey: process.env.MINIO_SECRET_KEY || "",
    bucket: process.env.MINIO_BUCKET || process.env.MINIO_BUCKET_NAME || "devlabs",
    publicBaseUrl: (process.env.MINIO_PUBLIC_URL || "").replace(/\/$/, ""),
  },
  envPath,
};

