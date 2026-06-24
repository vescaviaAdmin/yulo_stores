import Order from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import * as notifyService from './notify.service.js';

const VALID_TRANSITIONS = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['out_for_delivery', 'delivered', 'cancelled'],
};

export const getQueue = (restaurantId) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return Order.find({
    restaurantId,
    status: 'placed',
    createdAt: { $gte: startOfToday },
  })
    .sort({ createdAt: 1 })
    .lean();
};

export const getBoard = async (restaurantId) => {
  const orders = await Order.find({
    restaurantId,
    status: { $in: ['confirmed', 'preparing', 'ready'] },
  })
    .sort({ createdAt: 1 })
    .lean();

  return {
    confirmed: orders.filter((o) => o.status === 'confirmed'),
    preparing: orders.filter((o) => o.status === 'preparing'),
    ready: orders.filter((o) => o.status === 'ready'),
  };
};

export const updateOrderStatus = async ({ orderId, currentStatus, newStatus, staffId }) => {
  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed?.includes(newStatus)) {
    throw new ApiError(
      400,
      'INVALID_TRANSITION',
      `Cannot transition from '${currentStatus}' to '${newStatus}'`
    );
  }

  const order = await Order.findOneAndUpdate(
    { _id: orderId, status: currentStatus },
    { $set: { status: newStatus } },
    { new: true }
  );

  if (!order) {
    throw new ApiError(
      409,
      'CONCURRENT_UPDATE',
      'Status was already changed by another request — please refresh'
    );
  }

  notifyService.orderStatusUpdated(order);
  return order;
};
