import { rateLimit } from 'express-rate-limit'

export const rateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 1000, // Limits to 100 request each 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  ipv6Subnet: 56,
})
