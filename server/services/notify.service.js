import { io } from '../socket.js';
import logger from '../utils/logger.js';

export const newOrder = (order) => {
  try {
    io?.to(`restaurant:${order.restaurantId}`).emit('order:new', order);
  } catch (err) {
    logger.error({ err, orderId: order._id }, 'Failed to emit order:new');
  }
};
