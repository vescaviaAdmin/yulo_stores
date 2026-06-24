import jwt from 'jsonwebtoken';
import { redis } from '../config/redis.js';
import { env } from '../config/env.js';
import StaffMember from '../models/StaffMember.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticateStaff = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new ApiError(401, 'UNAUTHORIZED', 'No token provided');
  }
  const token = header.slice(7);

  const revoked = await redis.get(`blacklist:${token}`);
  if (revoked !== null) {
    throw new ApiError(401, 'INVALID_TOKEN', 'Token has been revoked');
  }

  const decoded = jwt.verify(token, env.JWT_STAFF_SECRET);

  const staff = await StaffMember.findById(decoded.staffId).lean();
  if (!staff || !staff.isActive) {
    throw new ApiError(401, 'INVALID_TOKEN', 'Staff member not found');
  }

  req.staff = { _id: staff._id, role: staff.role, restaurantId: staff.restaurantId, name: staff.name };
  next();
});
