const env = require("./env");

let cachedClient = null;

const getMinioPackage = () => {
  try {
    return require("minio");
  } catch (error) {
    const packageError = new Error("Missing 'minio' package. Run npm install in server to enable MinIO uploads.");
    packageError.code = "MINIO_PACKAGE_MISSING";
    throw packageError;
  }
};

const getMinioClient = () => {
  if (cachedClient) {
    return cachedClient;
  }

  const { Client } = getMinioPackage();

  cachedClient = new Client({
    endPoint: env.minio.endPoint,
    port: env.minio.port,
    useSSL: env.minio.useSSL,
    accessKey: env.minio.accessKey,
    secretKey: env.minio.secretKey,
  });

  return cachedClient;
};

const getMinioPublicBaseUrl = () => {
  if (env.minio.publicBaseUrl) {
    return env.minio.publicBaseUrl;
  }

  const protocol = env.minio.useSSL ? "https" : "http";
  return `${protocol}://${env.minio.endPoint}${env.minio.port ? `:${env.minio.port}` : ""}`;
};

module.exports = {
  getMinioClient,
  getMinioPublicBaseUrl,
};
