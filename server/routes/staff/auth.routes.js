import { Router } from 'express';
import { z } from 'zod';
import { staffLogin, staffLogout } from '../../controllers/staff/auth.controller.js';
import { authenticateStaff } from '../../middleware/authenticateStaff.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

const loginSchema = z.object({
  restaurantId: z.string().min(1),
  staffCode:    z.string().min(1).max(10),
  pin:          z.string().min(4).max(8),
});

router.post('/login', authLimiter, validate(loginSchema), staffLogin);
router.post('/logout', authenticateStaff, staffLogout);

export default router;
