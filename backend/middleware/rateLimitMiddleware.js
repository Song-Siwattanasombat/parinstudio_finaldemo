const buckets = new Map();

const rateLimit = ({ windowMs, max, message }) => (req, res, next) => {
  const key = `${req.ip}:${req.originalUrl}`;
  const now = Date.now();
  const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

  if (bucket.resetAt <= now) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  if (bucket.count > max) {
    res.status(429);
    throw new Error(message || 'Too many requests. Please try again later.');
  }

  next();
};

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login or registration attempts. Please try again in 15 minutes.',
});

export { authRateLimit };
