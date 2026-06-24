import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { getMe, updateMe, addAddress, removeAddress } from '../controllers/user.controller.js';

const router = Router();

router.use(authenticate);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.post('/me/addresses', addAddress);
router.delete('/me/addresses/:addrId', removeAddress);

export default router;
