import { Router } from 'express';
import { authenticateStaff } from '../../middleware/authenticateStaff.js';
import { authorizeStaffRole } from '../../middleware/authorizeStaffRole.js';
import { authorizeStaffRestaurant } from '../../middleware/authorizeStaffRestaurant.js';
import { getQueue, getBoard, updateStatus, getOrderDetail } from '../../controllers/staff/kitchen.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticateStaff, authorizeStaffRole('chef'), authorizeStaffRestaurant);

router.get('/queue', getQueue);
router.get('/board', getBoard);
router.patch('/orders/:orderId/status', updateStatus);
router.get('/orders/:orderId', getOrderDetail);

export default router;
