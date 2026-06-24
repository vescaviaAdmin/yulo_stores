import { Router } from 'express';
import { getRestaurant, updateRestaurant } from '../../controllers/owner/restaurant.controller.js';

const router = Router({ mergeParams: true });

router.get('/', getRestaurant);
router.patch('/', updateRestaurant);

export default router;
