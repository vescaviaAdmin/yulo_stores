import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { redis } from '../config/redis.js';

export const hashPassword = (plain) =>
  argon2.hash(plain, { type: argon2.argon2id });

export const verifyPassword = (hash, plain) =>
  argon2.verify(hash, plain);

export const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES }
  );
  const refreshToken = jwt.sign(
    { userId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES }
  );
  return { accessToken, refreshToken };
};

export const generateStaffToken = (staffId, role, restaurantId) =>
  jwt.sign({ staffId, role, restaurantId }, env.JWT_STAFF_SECRET, {
    expiresIn: env.JWT_STAFF_EXPIRES,
  });

export const blacklistToken = async (token) => {
  const decoded = jwt.decode(token);
  if (!decoded?.exp) return;
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) await redis.set(`blacklist:${token}`, '1', 'EX', ttl);
};
