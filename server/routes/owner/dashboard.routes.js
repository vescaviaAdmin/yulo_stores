import { Router } from 'express';
import { getKPIs, getSalesChart, getTopItems, getRecentOrders } from '../../controllers/owner/dashboard.controller.js';

const router = Router({ mergeParams: true });

router.get('/', getKPIs);
router.get('/sales', getSalesChart);
router.get('/top-items', getTopItems);
router.get('/recent-orders', getRecentOrders);

export default router;
