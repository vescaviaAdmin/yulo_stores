import jwt from 'jsonwebtoken';
import { redis } from '../config/redis.js';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new ApiError(401, 'INVALID_TOKEN', 'No token provided');
  }
  const token = header.slice(7);

  const revoked = await redis.get(`blacklist:${token}`);
  if (revoked !== null) {
    throw new ApiError(401, 'INVALID_TOKEN', 'Token has been revoked');
  }

  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

  const user = await User.findById(decoded.userId).lean();
  if (!user || !user.isActive) {
    throw new ApiError(401, 'INVALID_TOKEN', 'User not found');
  }

  req.user = { _id: user._id, role: user.role, name: user.name, email: user.email };
  next();
});
