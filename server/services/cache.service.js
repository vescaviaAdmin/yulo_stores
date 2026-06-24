import { redis } from '../config/redis.js';
import logger from '../utils/logger.js';

export const get = async (key) => {
  try {
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  } catch (err) {
    logger.error({ err, key }, 'Cache get error');
    return null;
  }
};

export const set = async (key, data, ttlSeconds) => {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (err) {
    logger.error({ err, key }, 'Cache set error');
  }
};

export const invalidate = async (key) => {
  try {
    await redis.del(key);
  } catch (err) {
    logger.error({ err, key }, 'Cache invalidate error');
  }
};
