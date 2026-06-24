import { Router } from 'express';
import { list, create, update, remove, publish, draft } from '../../controllers/owner/discount.controller.js';

const router = Router({ mergeParams: true });

router.get('/', list);
router.post('/', create);
router.patch('/:dId', update);
router.delete('/:dId', remove);
router.patch('/:dId/publish', publish);
router.patch('/:dId/draft', draft);

export default router;
