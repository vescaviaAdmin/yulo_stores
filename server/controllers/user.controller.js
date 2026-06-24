import { z } from 'zod';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  profilePicture: z.string().url().optional(),
});

const addressSchema = z.object({
  label: z.enum(['home', 'work', 'other']).default('home'),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  location: z.object({
    type: z.literal('Point').default('Point'),
    coordinates: z.tuple([z.number(), z.number()]).optional(),
  }).optional(),
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');
  sendSuccess(res, 200, 'Profile', { user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const result = updateProfileSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid input', result.error.flatten());
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: result.data },
    { new: true }
  );
  sendSuccess(res, 200, 'Profile updated', { user });
});

export const addAddress = asyncHandler(async (req, res) => {
  const result = addressSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid address', result.error.flatten());
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $push: { savedAddresses: result.data } },
    { new: true }
  );
  sendSuccess(res, 201, 'Address added', { savedAddresses: user.savedAddresses });
});

export const removeAddress = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { savedAddresses: { _id: req.params.addrId } } },
    { new: true }
  );
  sendSuccess(res, 200, 'Address removed', { savedAddresses: user.savedAddresses });
});
