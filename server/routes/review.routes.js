import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
import { createReview } from '../controllers/review.controller.js';

const router = Router();

router.post('/:orderId/review', authenticate, authorizeRole('customer'), createReview);

export default router;
