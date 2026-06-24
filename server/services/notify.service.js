import { getIO } from '../socket.js';

export const notifyService = {
  newOrder(order) {
    const io = getIO();
    const payload = {
      orderId: order._id,
      type: order.type,
      tableNumber: order.tableNumber,
      batchNumber: order.batchNumber,
      items: order.items,
      specialInstructions: order.specialInstructions,
      subtotal: order.subtotal,
    };
    io.to(`restaurant:${order.restaurantId}`).emit('new_order', payload);
    io.to(`kitchen:${order.restaurantId}`).emit('new_order', payload);
  },

  orderStatusUpdated(order) {
    const io = getIO();
    const payload = { orderId: order._id, status: order.status, updatedAt: order.updatedAt };
    io.to(`restaurant:${order.restaurantId}`).emit('order_status_updated', payload);
    io.to(`kitchen:${order.restaurantId}`).emit('order_status_updated', payload);
    io.to(`order:${order._id}`).emit('order_status_updated', payload);
    if (order.staffId) {
      io.to(`waiter:${order.restaurantId}:${order.staffId}`).emit('order_status_updated', payload);
    }
  },

  billUpdated({ _id, tableId, grandTotal, discountsApplied, batches }) {
    const io = getIO();
    io.to(`table:${tableId}`).emit('bill_updated', {
      billId: _id,
      grandTotal,
      discountsApplied,
      lastBatch: batches?.at(-1),
    });
  },

  tableStatusChanged(restaurantId, table, sessionStatus) {
    const io = getIO();
    io.to(`restaurant:${restaurantId}`).emit('table_status_changed', {
      tableId: table._id,
      identifier: table.identifier,
      sessionStatus,
    });
  },
};
