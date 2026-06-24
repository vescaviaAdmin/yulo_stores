import { Router } from 'express';
import {
  listRestaurants,
  getRestaurant,
  getMenu,
  getReviews,
} from '../controllers/restaurant.controller.js';

const router = Router();

router.get('/', listRestaurants);
router.get('/:id', getRestaurant);
router.get('/:id/menu', getMenu);
router.get('/:id/reviews', getReviews);

export default router;
