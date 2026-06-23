import { Server } from 'socket.io';
import { env } from './config/env.js';
import logger from './utils/logger.js';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: env.ALLOWED_ORIGINS.split(','),
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.debug({ socketId: socket.id }, 'Socket connected');

    socket.on('disconnect', () => {
      logger.debug({ socketId: socket.id }, 'Socket disconnected');
    });
  });

  return io;
}

export { io };
