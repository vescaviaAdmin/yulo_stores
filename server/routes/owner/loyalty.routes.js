import { Router } from 'express';
import {
  getProgram, updateProgram,
  listMilestones, createMilestone, updateMilestone, deleteMilestone,
} from '../../controllers/owner/loyalty.controller.js';

const router = Router({ mergeParams: true });

router.get('/', getProgram);
router.patch('/', updateProgram);
router.get('/milestones', listMilestones);
router.post('/milestones', createMilestone);
router.patch('/milestones/:mId', updateMilestone);
router.delete('/milestones/:mId', deleteMilestone);

export default router;
