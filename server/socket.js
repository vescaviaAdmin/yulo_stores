import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './config/env.js';
import { redis } from './config/redis.js';
import Order from './models/Order.js';
import Restaurant from './models/Restaurant.js';
import * as liveMonitorService from './services/liveMonitor.service.js';
import logger from './utils/logger.js';

let io;

const verifyUserToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch {
    return null;
  }
};

const verifyStaffToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_STAFF_SECRET);
  } catch {
    return null;
  }
};

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.ALLOWED_ORIGINS.split(','), credentials: true },
  });

  io.on('connection', (socket) => {
    logger.debug({ socketId: socket.id }, 'socket connected');

    socket.on('join_restaurant', async ({ restaurantId, token }) => {
      const decoded = verifyUserToken(token);
      if (!decoded || decoded.role !== 'restaurant_owner') return socket.disconnect();
      const owns = await Restaurant.exists({ _id: restaurantId, ownerId: decoded.userId });
      if (!owns) return socket.disconnect();
      socket.join(`restaurant:${restaurantId}`);
      socket.data.restaurantId = restaurantId;
      await redis.sadd('live:active_restaurants', restaurantId);
    });

    socket.on('join_kitchen', async ({ restaurantId, staffToken }) => {
      const decoded = verifyStaffToken(staffToken);
      if (!decoded || decoded.role !== 'chef') return socket.disconnect();
      if (decoded.restaurantId !== restaurantId) return socket.disconnect();
      socket.join(`kitchen:${restaurantId}`);
    });

    socket.on('join_waiter', async ({ restaurantId, staffToken }) => {
      const decoded = verifyStaffToken(staffToken);
      if (!decoded || decoded.role !== 'waiter') return socket.disconnect();
      if (decoded.restaurantId !== restaurantId) return socket.disconnect();
      socket.join(`restaurant:${restaurantId}`);
      socket.join(`waiter:${restaurantId}:${decoded.staffId}`);
    });

    socket.on('join_order', async ({ orderId, token }) => {
      const decoded = verifyUserToken(token);
      if (!decoded) return socket.disconnect();
      const order = await Order.findOne({ _id: orderId, userId: decoded.userId }).lean();
      if (!order) return socket.disconnect();
      socket.join(`order:${orderId}`);
    });

    socket.on('disconnect', async (reason) => {
      logger.debug({ socketId: socket.id, reason }, 'socket disconnected');
      if (socket.data.restaurantId) {
        const room = io.sockets.adapter.rooms.get(`restaurant:${socket.data.restaurantId}`);
        if (!room || room.size === 0) {
          await redis.srem('live:active_restaurants', socket.data.restaurantId);
        }
      }
    });
  });

  setInterval(async () => {
    const ids = await redis.smembers('live:active_restaurants');
    for (const restaurantId of ids) {
      const stats = await liveMonitorService.getStats(restaurantId);
      io.to(`restaurant:${restaurantId}`).emit('live_visitor_update', stats);
    }
  }, 30_000);
}

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
