import { io } from '../socket.js';
import logger from '../utils/logger.js';

export const newOrder = (order) => {
  try {
    io?.to(`restaurant:${order.restaurantId}`).emit('order:new', order);
  } catch (err) {
    logger.error({ err, orderId: order._id }, 'Failed to emit order:new');
  }
};

export const orderStatusUpdated = (order) => {
  try {
    io?.to(`restaurant:${order.restaurantId}`).emit('order:status_updated', {
      orderId: order._id,
      status: order.status,
      tableSessionId: order.tableSessionId,
    });
  } catch (err) {
    logger.error({ err, orderId: order._id }, 'Failed to emit order:status_updated');
  }
};
