import { Router } from 'express';
import { authenticateStaff } from '../../middleware/authenticateStaff.js';
import { authorizeStaffRole } from '../../middleware/authorizeStaffRole.js';
import { authorizeStaffRestaurant } from '../../middleware/authorizeStaffRestaurant.js';
import {
  scanTable, getTables, getMenu, createOrder, getSessions, getBill, markPaid,
} from '../../controllers/staff/waiter.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticateStaff, authorizeStaffRole('waiter'), authorizeStaffRestaurant);

router.post('/tables/scan', scanTable);
router.get('/tables', getTables);
router.get('/menu', getMenu);
router.post('/orders', createOrder);
router.get('/sessions', getSessions);
router.get('/sessions/:sessionId/bill', getBill);
router.post('/sessions/:sessionId/bill/mark-paid', markPaid);

export default router;
