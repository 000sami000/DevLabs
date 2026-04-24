const Busboy = require("busboy");
const { PassThrough } = require("stream");
const { uploadPublicStream } = require("../utils/objectStorage");

const appendFieldValue = (body, name, value) => {
  if (body[name] === undefined) {
    body[name] = value;
    return;
  }

  if (Array.isArray(body[name])) {
    body[name].push(value);
    return;
  }

  body[name] = [body[name], value];
};

const isEmptyMultipartUploadError = (error) => {
  const message = String(error?.message || "").toLowerCase();
  const code = String(error?.code || "").toLowerCase();
  return message.includes("you must specify at least one part") || code === "invalidrequest";
};

const streamUploadToMinio = ({
  fileField = "file",
  prefix,
  required = false,
  limits,
  allowUploadFailure = false,
} = {}) => {
  return (req, res, next) => {
    const contentType = req.headers["content-type"] || "";

    if (!contentType.includes("multipart/form-data")) {
      req.file = req.file || null;
      req.body = req.body || {};
      return next();
    }

    const busboy = Busboy({
      headers: req.headers,
      limits: {
        files: 1,
        ...(limits || {}),
      },
    });

    const fields = {};
    let uploadedFile = null;
    let uploadPromise = Promise.resolve(null);
    let uploadError = null;
    let fileHandled = false;
    let finished = false;

    const complete = (error) => {
      if (finished) {
        return;
      }

      finished = true;

      if (error) {
        return next(error);
      }

      req.body = { ...(req.body || {}), ...fields };
      req.file = uploadedFile;

      if (required && !uploadedFile) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      return next();
    };

    busboy.on("field", (name, value) => {
      appendFieldValue(fields, name, value);
    });

    busboy.on("file", (fieldname, fileStream, info) => {
      if (fileHandled || fieldname !== fileField) {
        fileStream.resume();
        return;
      }

      fileHandled = true;

      const originalname = info?.filename || "";
      const mimetype = info?.mimeType || "application/octet-stream";

      // Treat empty file part as "no file provided".
      if (!String(originalname).trim()) {
        fileStream.resume();
        return;
      }

      let size = 0;
      let passthrough = null;
      let uploadStarted = false;

      const startUpload = () => {
        if (uploadStarted) {
          return;
        }

        uploadStarted = true;
        passthrough = new PassThrough();

        uploadPromise = uploadPublicStream({
          stream: passthrough,
          originalname,
          mimetype,
          prefix,
        })
          .then((fileMeta) => {
            if (!fileMeta) {
              uploadedFile = null;
              return;
            }

            uploadedFile = {
              ...fileMeta,
              size,
            };
          })
          .catch((error) => {
            uploadError = error;
          });
      };

      fileStream.on("data", (chunk) => {
        size += chunk.length;
        startUpload();
        passthrough.write(chunk);
      });

      fileStream.on("end", () => {
        if (passthrough) {
          passthrough.end();
        }
      });

      fileStream.on("error", (error) => {
        uploadError = error;
        if (passthrough) {
          passthrough.destroy(error);
        }
      });
    });

    busboy.on("error", complete);

    busboy.on("finish", async () => {
      try {
        await uploadPromise;

        if (uploadError) {
          const isEmptyUploadError = isEmptyMultipartUploadError(uploadError);
          const shouldIgnoreUploadError = isEmptyUploadError || (allowUploadFailure && !required);

          if (!shouldIgnoreUploadError) {
            throw uploadError;
          }

          uploadedFile = null;
        }

        complete();
      } catch (error) {
        complete(error);
      }
    });

    req.pipe(busboy);
  };
};

module.exports = { streamUploadToMinio };
