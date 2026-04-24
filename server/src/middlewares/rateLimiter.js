const requests = new Map();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS =300 ;

const apiRateLimiter = (req, res, next) => {
  const key = req.ip || "unknown";
  const now = Date.now();
  const entry = requests.get(key) || { count: 0, start: now };

  if (now - entry.start > WINDOW_MS) {
    entry.count = 0;
    entry.start = now;
  }

  entry.count += 1;
  requests.set(key, entry);

  if (entry.count > MAX_REQUESTS) {
    return res.status(429).json({ message: "Too many requests" });
  }

  return next();
};

module.exports = { apiRateLimiter };
