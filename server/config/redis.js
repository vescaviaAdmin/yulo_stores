import Redis from 'ioredis';
import { env } from './env.js';

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  // Don't spam reconnect attempts — Redis is non-critical; null disables retries
  retryStrategy: () => null,
});

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis error:', err.message);
});

export async function connectRedis() {
  if (redis.status === 'ready') return;
  try {
    await redis.connect();
  } catch (err) {
    // Redis is non-critical — log and continue; cache will fall back to DB
    console.warn('Redis unavailable, continuing without cache:', err.message);
  }
}
