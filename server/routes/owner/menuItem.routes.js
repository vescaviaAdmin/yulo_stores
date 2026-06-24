import { Router } from 'express';
import { upload } from '../../middleware/upload.js';
import {
  list, create, getOne, update, remove, toggle, updateIngredients,
} from '../../controllers/owner/menuItem.controller.js';

const router = Router({ mergeParams: true });

router.get('/', list);
router.post('/', upload('image', 5), create);
router.get('/:itemId', getOne);
router.patch('/:itemId', upload('image', 5), update);
router.delete('/:itemId', remove);
router.patch('/:itemId/toggle', toggle);
router.patch('/:itemId/ingredients', updateIngredients);

export default router;
