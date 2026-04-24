const format = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  if (meta === undefined) {
    return `[${timestamp}] ${level.toUpperCase()} ${message}`;
  }

  return `[${timestamp}] ${level.toUpperCase()} ${message} ${JSON.stringify(meta)}`;
};

module.exports = {
  info: (message, meta) => console.log(format("info", message, meta)),
  warn: (message, meta) => console.warn(format("warn", message, meta)),
  error: (message, meta) => console.error(format("error", message, meta)),
};
