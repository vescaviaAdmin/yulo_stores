import Order from '../models/Order.js';
import TableSession from '../models/TableSession.js';
import { redis } from '../config/redis.js';

export const getStats = async (restaurantId) => {
  const [openSessions, pendingOrders, liveRaw] = await Promise.all([
    TableSession.countDocuments({ restaurantId, status: 'open' }),
    Order.countDocuments({ restaurantId, status: { $in: ['placed', 'confirmed', 'preparing'] } }),
    redis.get(`live:count:${restaurantId}`),
  ]);

  return {
    restaurantId,
    openSessions,
    pendingOrders,
    liveCount: parseInt(liveRaw, 10) || 0,
  };
};
