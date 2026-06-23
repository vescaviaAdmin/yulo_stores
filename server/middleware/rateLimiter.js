import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { status: 'error', code: 'RATE_LIMITED', message: 'Too many login attempts' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { status: 'error', code: 'RATE_LIMITED', message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});
