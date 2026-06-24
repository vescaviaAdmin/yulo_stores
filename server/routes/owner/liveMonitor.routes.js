import { Router } from 'express';
import { getStats, getActiveVisitors, getRepeatVisitors, createTargetedOffer } from '../../controllers/owner/liveMonitor.controller.js';

const router = Router({ mergeParams: true });

router.get('/', getStats);
router.get('/visitors', getActiveVisitors);
router.get('/repeat', getRepeatVisitors);
router.post('/offer', createTargetedOffer);

export default router;
