import { z } from 'zod';
import Order from '../models/Order.js';
import * as orderService from '../services/order.service.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const orderItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().min(1),
  note: z.string().optional(),
});

const createOrderSchema = z.object({
  restaurantId: z.string().min(1),
  items: z.array(orderItemSchema).min(1),
  type: z.enum(['delivery', 'takeaway']),
  deliveryAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    coordinates: z.tuple([z.number(), z.number()]).optional(),
  }).optional(),
  paymentMethod: z.enum(['cash', 'online', 'card']).default('cash'),
  specialInstructions: z.string().optional(),
});

export const createOrder = asyncHandler(async (req, res) => {
  const result = createOrderSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid order data', result.error.flatten());
  }

  const { restaurantId, items, type, deliveryAddress, paymentMethod, specialInstructions } = result.data;
  const idempotencyKey = req.headers['idempotency-key'] || null;

  const order = await orderService.createOrder({
    restaurantId,
    userId: req.user._id,
    type,
    items,
    deliveryAddress,
    paymentMethod,
    specialInstructions,
    idempotencyKey,
  });

  if (order.duplicate) {
    return sendSuccess(res, 200, 'Duplicate — existing order returned', { order: { orderId: order.orderId } });
  }

  const responseData = { order };

  // Razorpay placeholder for online payment
  if (paymentMethod === 'online') {
    if (env.RAZORPAY_KEY_ID) {
      try {
        const Razorpay = (await import('razorpay')).default;
        const rzp = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
        const rzpOrder = await rzp.orders.create({
          amount: Math.round(order.subtotal * 100),
          currency: 'INR',
          receipt: order._id.toString(),
        });
        responseData.clientSecret = rzpOrder.id;
      } catch {
        responseData.clientSecret = null;
      }
    } else {
      responseData.clientSecret = null;
    }
  }

  sendSuccess(res, 201, 'Order placed', responseData);
});

export const listOrders = asyncHandler(async (req, res) => {
  const { page = 1 } = req.query;
  const parsedPage = Math.max(1, parseInt(page, 10));
  const PAGE_SIZE = 20;

  const [orders, total] = await Promise.all([
    Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip((parsedPage - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Order.countDocuments({ userId: req.user._id }),
  ]);

  sendSuccess(res, 200, 'Orders', { orders, total, page: parsedPage });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, userId: req.user._id }).lean();
  if (!order) throw new ApiError(404, 'NOT_FOUND', 'Order not found');
  sendSuccess(res, 200, 'Order', { order });
});
