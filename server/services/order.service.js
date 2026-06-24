import mongoose from 'mongoose';
import Order from '../models/Order.js';
import TableSession from '../models/TableSession.js';
import MenuItem from '../models/MenuItem.js';
import Restaurant from '../models/Restaurant.js';
import { redis } from '../config/redis.js';
import { ApiError } from '../utils/ApiError.js';
import { notifyService } from './notify.service.js';

export const createOrder = async ({
  restaurantId,
  tableSessionId,
  userId,
  staffId,
  type,
  items,
  specialInstructions = '',
  paymentMethod,
  deliveryAddress,
  idempotencyKey,
}) => {
  // Step 0 — Idempotency check
  if (idempotencyKey) {
    const cached = await redis.get(`idem:${idempotencyKey}:${restaurantId}`);
    if (cached) return { orderId: cached, duplicate: true };
  }

  // Step 1 — Validate restaurant
  const restaurant = await Restaurant.findById(restaurantId).lean();
  if (!restaurant || !restaurant.isActive) {
    throw new ApiError(404, 'NOT_FOUND', 'Restaurant not found');
  }

  // Step 2 — Validate and snapshot items
  const itemIds = items.map((i) => i.menuItemId);
  const menuItems = await MenuItem.find({
    _id: { $in: itemIds },
    restaurantId,
    isAvailable: true,
  }).lean();

  if (menuItems.length !== itemIds.length) {
    throw new ApiError(400, 'ORDER_ITEM_UNAVAILABLE', 'One or more items are unavailable');
  }

  const menuItemMap = new Map(menuItems.map((m) => [m._id.toString(), m]));

  const snapshots = items.map((i) => {
    const mi = menuItemMap.get(i.menuItemId.toString());
    const price = mi.discountedPrice ?? mi.sellingPrice;
    return {
      menuItemId: mi._id,
      name: mi.name,
      price,
      quantity: i.quantity,
      note: i.note || '',
    };
  });

  const subtotal = snapshots.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Step 3 — Dine-in path (with transaction)
  if (tableSessionId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const updatedSession = await TableSession.findOneAndUpdate(
        { _id: tableSessionId, status: 'open' },
        { $inc: { batchCount: 1 } },
        { new: true, session }
      );
      if (!updatedSession) {
        throw new ApiError(400, 'TABLE_SESSION_CLOSED', 'Session is not open');
      }

      const batchNumber = updatedSession.batchCount;
      const tableNumber = updatedSession.tableNumber ?? null;

      const [order] = await Order.create(
        [
          {
            restaurantId,
            tableSessionId,
            userId,
            staffId,
            type: 'dine_in',
            tableNumber,
            batchNumber,
            items: snapshots,
            subtotal,
            specialInstructions,
            paymentMethod: paymentMethod || 'cash',
          },
        ],
        { session }
      );

      await TableSession.findByIdAndUpdate(
        tableSessionId,
        { $push: { orders: order._id } },
        { session }
      );

      await session.commitTransaction();

      if (idempotencyKey) {
        await redis.set(
          `idem:${idempotencyKey}:${restaurantId}`,
          order._id.toString(),
          'EX',
          86400
        );
      }

      notifyService.newOrder(order);
      return order;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  // Step 4 — Delivery / takeaway path
  const order = await Order.create({
    restaurantId,
    userId,
    staffId: null,
    type,
    batchNumber: 1,
    items: snapshots,
    subtotal,
    specialInstructions,
    paymentMethod,
    deliveryAddress,
  });

  if (idempotencyKey) {
    await redis.set(
      `idem:${idempotencyKey}:${restaurantId}`,
      order._id.toString(),
      'EX',
      86400
    );
  }

  notifyService.newOrder(order);
  return order;
};
