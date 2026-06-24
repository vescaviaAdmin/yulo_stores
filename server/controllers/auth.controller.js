import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import * as authService from '../services/auth.service.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'DUPLICATE_KEY', 'email already exists');

  const passwordHash = await authService.hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role: role || 'customer' });

  const { accessToken, refreshToken } = authService.generateTokens(user._id, user.role);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTS);

  sendSuccess(res, 201, 'Account created', { user, accessToken });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const valid = await authService.verifyPassword(user.passwordHash, password);
  if (!valid) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

  const { accessToken, refreshToken } = authService.generateTokens(user._id, user.role);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTS);

  sendSuccess(res, 200, 'Login successful', { user, accessToken });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, 'INVALID_TOKEN', 'No refresh token');

  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);

  const user = await User.findById(decoded.userId).lean();
  if (!user || !user.isActive) throw new ApiError(401, 'INVALID_TOKEN', 'User not found');

  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES }
  );

  sendSuccess(res, 200, 'Token refreshed', { accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    await authService.blacklistToken(header.slice(7));
  }
  res.clearCookie('refreshToken');
  sendSuccess(res, 200, 'Logged out', null);
});
