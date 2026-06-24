import { Router } from 'express';
import { listBills, getBill } from '../../controllers/owner/bill.controller.js';

const router = Router({ mergeParams: true });

router.get('/', listBills);
router.get('/:billId', getBill);

export default router;
