import { Router } from 'express';
import { authenticateStaff } from '../../middleware/authenticateStaff.js';
import { authorizeStaffRestaurant } from '../../middleware/authorizeStaffRestaurant.js';
import staffAuthRoutes from './auth.routes.js';
import waiterRoutes from './waiter.routes.js';
import kitchenRoutes from './kitchen.routes.js';

const staffRouter = Router();

// Staff login — no auth required
staffRouter.use('/auth', staffAuthRoutes);

// Restaurant-scoped routes — staff token must match the restaurant
const staffRestaurantRouter = Router({ mergeParams: true });
staffRestaurantRouter.use(authenticateStaff, authorizeStaffRestaurant);
staffRestaurantRouter.use('/waiter', waiterRoutes);
staffRestaurantRouter.use('/kitchen', kitchenRoutes);

staffRouter.use('/:restaurantId', staffRestaurantRouter);

export default staffRouter;
