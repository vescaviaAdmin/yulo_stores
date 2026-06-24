import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRole } from '../../middleware/authorizeRole.js';
import { authorizeRestaurant } from '../../middleware/authorizeRestaurant.js';
import { createRestaurant, listMyRestaurants } from '../../controllers/owner/restaurant.controller.js';
import dashboardRoutes from './dashboard.routes.js';
import restaurantRoutes from './restaurant.routes.js';
import settingsRoutes from './settings.routes.js';
import categoryRoutes from './category.routes.js';
import menuItemRoutes from './menuItem.routes.js';
import tableRoutes from './table.routes.js';
import orderRoutes from './order.routes.js';
import billRoutes from './bill.routes.js';
import discountRoutes from './discount.routes.js';
import loyaltyRoutes from './loyalty.routes.js';
import liveMonitorRoutes from './liveMonitor.routes.js';
import staffRoutes from './staff.routes.js';

const ownerRouter = Router();

ownerRouter.use(authenticate, authorizeRole('restaurant_owner'));

// Top-level restaurant management (must come before /:restaurantId to avoid route conflict)
ownerRouter.get('/restaurants', listMyRestaurants);
ownerRouter.post('/restaurants', createRestaurant);

// Scoped per-restaurant sub-router — mergeParams exposes :restaurantId to children
const restaurantScopedRouter = Router({ mergeParams: true });
restaurantScopedRouter.use(authorizeRestaurant);
restaurantScopedRouter.use('/dashboard', dashboardRoutes);
restaurantScopedRouter.use('/restaurant', restaurantRoutes);
restaurantScopedRouter.use('/settings', settingsRoutes);
restaurantScopedRouter.use('/categories', categoryRoutes);
restaurantScopedRouter.use('/menu-items', menuItemRoutes);
restaurantScopedRouter.use('/tables', tableRoutes);
restaurantScopedRouter.use('/orders', orderRoutes);
restaurantScopedRouter.use('/bills', billRoutes);
restaurantScopedRouter.use('/discounts', discountRoutes);
restaurantScopedRouter.use('/loyalty', loyaltyRoutes);
restaurantScopedRouter.use('/live-monitor', liveMonitorRoutes);
restaurantScopedRouter.use('/staff', staffRoutes);

ownerRouter.use('/:restaurantId', restaurantScopedRouter);

export default ownerRouter;
