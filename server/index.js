import 'dotenv/config';
import http from 'http';
import { app } from './app.js';
import { initSocket } from './socket.js';
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';
import { env } from './config/env.js';
import logger from './utils/logger.js';

const server = http.createServer(app);
initSocket(server);

await connectDB();
await connectRedis();

server.listen(env.PORT, () => logger.info(`Server running on port ${env.PORT}`));

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  server.close(() => process.exit(0));
});
