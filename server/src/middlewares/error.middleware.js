const logger = require("../config/logger");

const notFoundHandler = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  logger.error("Unhandled request error", {
    method: req.method,
    path: req.originalUrl,
    message: err.message,
  });

  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
};

module.exports = { notFoundHandler, errorHandler };
