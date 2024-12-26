import { RateLimiterRedis } from 'rate-limiter-flexible';

import Redis from 'iovalkey';

const redis = new Redis();

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'unsplash_ratelimit',
  points: 50, // Number of requests
  duration: 3600, // Per hour
});

export const checkRateLimit = async (ip: string) => {
  try {
    await rateLimiter.consume(ip);
    return true;
  } catch (error) {
    return false;
  }
};