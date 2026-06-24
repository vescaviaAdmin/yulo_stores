import { Router } from 'express';
import { listOrders, getOrder } from '../../controllers/owner/order.controller.js';

const router = Router({ mergeParams: true });

router.get('/', listOrders);
router.get('/:orderId', getOrder);

export default router;
