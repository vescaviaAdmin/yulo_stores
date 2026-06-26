import Order from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { notifyService } from './notify.service.js';

const VALID_TRANSITIONS = {
  placed:    ['confirmed', 'preparing', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready:     ['out_for_delivery', 'delivered', 'cancelled'],
};

export const getQueue = (restaurantId) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  // placed = new order; confirmed = accepted but chef hasn't started
  return Order.find({
    restaurantId,
    status: { $in: ['placed', 'confirmed'] },
    createdAt: { $gte: startOfToday },
  })
    .sort({ createdAt: 1 })
    .lean();
};

export const getBoard = async (restaurantId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [active, completed] = await Promise.all([
    Order.find({
      restaurantId,
      status: { $in: ['preparing', 'ready'] },
    }).sort({ createdAt: 1 }).lean(),
    Order.find({
      restaurantId,
      status: { $in: ['delivered', 'out_for_delivery'] },
      updatedAt: { $gte: today },
    }).sort({ updatedAt: -1 }).limit(20).lean(),
  ]);

  return {
    preparing: active.filter((o) => o.status === 'preparing'),
    ready:     active.filter((o) => o.status === 'ready'),
    completed,
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
