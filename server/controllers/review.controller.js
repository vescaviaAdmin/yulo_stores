import { z } from 'zod';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().default(''),
});

export const createReview = asyncHandler(async (req, res) => {
  const result = reviewSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid review data', result.error.flatten());
  }

  const order = await Order.findOne({ _id: req.params.orderId, userId: req.user._id }).lean();
  if (!order) throw new ApiError(404, 'NOT_FOUND', 'Order not found');
  if (order.status !== 'delivered') {
    throw new ApiError(400, 'ORDER_NOT_DELIVERED', 'Can only review delivered orders');
  }

  const existing = await Review.findOne({ orderId: req.params.orderId });
  if (existing) throw new ApiError(409, 'ALREADY_REVIEWED', 'You have already reviewed this order');

  const review = await Review.create({
    userId: req.user._id,
    restaurantId: order.restaurantId,
    orderId: order._id,
    rating: result.data.rating,
    comment: result.data.comment,
  });

  sendSuccess(res, 201, 'Review submitted', { review });
});
