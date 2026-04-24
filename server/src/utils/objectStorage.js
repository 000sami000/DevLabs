const crypto = require("crypto");
const env = require("../config/env");
const { getMinioClient, getMinioPublicBaseUrl } = require("../config/minio");

let bucketReadyPromise = null;

const ensureStorageConfig = () => {
  if (!env.minio.accessKey || !env.minio.secretKey || !env.minio.bucket) {
    const error = new Error("MinIO is not configured correctly");
    error.statusCode = 500;
    throw error;
  }
};

const getEncodedObjectPath = (objectName) =>
  String(objectName)
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

const getPublicObjectUrl = (objectName) =>
  `${getMinioPublicBaseUrl()}/${env.minio.bucket}/${getEncodedObjectPath(objectName)}`;

const ensurePublicBucket = async () => {
  ensureStorageConfig();

  if (!bucketReadyPromise) {
    bucketReadyPromise = (async () => {
      const client = getMinioClient();
      const bucketExists = await client.bucketExists(env.minio.bucket);

      if (!bucketExists) {
        await client.makeBucket(env.minio.bucket, "us-east-1");
      }

      await client.setBucketPolicy(
        env.minio.bucket,
        JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { AWS: ["*"] },
              Action: ["s3:GetBucketLocation", "s3:ListBucket"],
              Resource: [`arn:aws:s3:::${env.minio.bucket}`],
            },
            {
              Effect: "Allow",
              Principal: { AWS: ["*"] },
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${env.minio.bucket}/*`],
            },
          ],
        })
      );
    })().catch((error) => {
      bucketReadyPromise = null;
      throw error;
    });
  }

  return bucketReadyPromise;
};

const buildObjectName = (prefix, originalname = "upload.bin") => {
  const ext = originalname && originalname.includes(".")
    ? `.${String(originalname).split('.').pop()}`
    : ".bin";

  return `${prefix}/${Date.now()}-${crypto.randomUUID()}${ext}`;
};

const uploadPublicStream = async ({ stream, originalname, mimetype, prefix }) => {
  if (!stream) {
    return null;
  }

  await ensurePublicBucket();

  const client = getMinioClient();
  const objectName = buildObjectName(prefix, originalname);

  await client.putObject(env.minio.bucket, objectName, stream, {
    "Content-Type": mimetype || "application/octet-stream",
  });

  return {
    storage: "minio",
    bucket: env.minio.bucket,
    objectName,
    url: getPublicObjectUrl(objectName),
    originalname,
    mimetype,
  };
};

const extractObjectName = (reference) => {
  if (!reference) {
    return null;
  }

  if (typeof reference === "string") {
    if (reference.startsWith("http://") || reference.startsWith("https://")) {
      try {
        const url = new URL(reference);
        const pathname = url.pathname.replace(/^\/+/, "");
        const bucketPrefix = `${env.minio.bucket}/`;

        if (pathname.startsWith(bucketPrefix)) {
          return decodeURIComponent(pathname.slice(bucketPrefix.length));
        }
      } catch {
        return null;
      }

      return null;
    }

    return reference;
  }

  if (typeof reference === "object") {
    if (reference.objectName) {
      return reference.objectName;
    }

    if (reference.url) {
      return extractObjectName(reference.url);
    }
  }

  return null;
};

const deleteStoredObject = async (reference) => {
  const objectName = extractObjectName(reference);

  if (!objectName) {
    return;
  }

  await ensurePublicBucket();

  try {
    await getMinioClient().removeObject(env.minio.bucket, objectName);
  } catch (error) {
    if (error.code !== "NoSuchKey" && error.code !== "NotFound") {
      throw error;
    }
  }
};

module.exports = {
  deleteStoredObject,
  uploadPublicStream,
};
