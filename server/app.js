import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import logger from './utils/logger.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import restaurantRoutes from './routes/restaurant.routes.js';
import orderRoutes from './routes/order.routes.js';
import reviewRoutes from './routes/review.routes.js';
import ownerRouter from './routes/owner/index.js';
import staffRouter from './routes/staff/index.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.ALLOWED_ORIGINS.split(','), credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(pinoHttp({ logger }));
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/owner', ownerRouter);
app.use('/api/staff', staffRouter);

app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(express.static('public'));

app.use((req, res) => res.status(404).json({
  status: 'error',
  code: 'NOT_FOUND',
  message: `Route ${req.method} ${req.originalUrl} not found`,
}));

app.use(errorHandler);

export { app };
