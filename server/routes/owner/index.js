import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRole } from '../../middleware/authorizeRole.js';
import { authorizeRestaurant } from '../../middleware/authorizeRestaurant.js';
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

const ownerRouter = Router();

ownerRouter.use(authenticate, authorizeRole('restaurant_owner'));

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

ownerRouter.use('/:restaurantId', restaurantScopedRouter);

export default ownerRouter;
