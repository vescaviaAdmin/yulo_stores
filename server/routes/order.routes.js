import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
import { createOrder, listOrders, getOrder } from '../controllers/order.controller.js';

const router = Router();

router.use(authenticate, authorizeRole('customer'));

router.post('/', createOrder);
router.get('/', listOrders);
router.get('/:id', getOrder);

export default router;
