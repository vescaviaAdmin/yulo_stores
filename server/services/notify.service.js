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

export const billUpdated = (bill) => {
  try {
    io?.to(`restaurant:${bill.restaurantId}`).emit('bill:updated', {
      billId: bill._id,
      tableSessionId: bill.tableSessionId,
      tableId: bill.tableId,
      grandTotal: bill.grandTotal,
    });
  } catch (err) {
    logger.error({ err, billId: bill._id }, 'Failed to emit bill:updated');
  }
};

export const tableStatusChanged = ({ restaurantId, tableId, tableSessionId, status }) => {
  try {
    io?.to(`restaurant:${restaurantId}`).emit('table:status_changed', {
      tableId,
      tableSessionId,
      status,
    });
  } catch (err) {
    logger.error({ err, tableId }, 'Failed to emit table:status_changed');
  }
};
