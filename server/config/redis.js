import Redis from 'ioredis';
import { env } from './env.js';

// Redis is optional — if REDIS_URL is not set, skip and use a no-op client.
export const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, {
      lazyConnect: true,
      retryStrategy: () => null,
    })
  : null;

if (redis) {
  redis.on('connect', () => console.log('Redis connected'));
  redis.on('error', (err) => console.error('Redis error:', err.message));
}

export async function connectRedis() {
  if (!redis) {
    console.warn('REDIS_URL not set — running without cache');
    return;
  }
  if (redis.status === 'ready') return;
  try {
    await redis.connect();
  } catch (err) {
    console.warn('Redis unavailable, continuing without cache:', err.message);
  }
}
