import { Router } from 'express';
import { listStaff, createStaff, updateStaff, removeStaff } from '../../controllers/owner/staff.controller.js';

const router = Router({ mergeParams: true });

router.get('/', listStaff);
router.post('/', createStaff);
router.patch('/:staffId', updateStaff);
router.delete('/:staffId', removeStaff);

export default router;
