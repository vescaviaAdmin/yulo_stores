import Restaurant from '../models/Restaurant.js';
import Review from '../models/Review.js';
import * as menuService from '../services/menu.service.js';
import * as cacheService from '../services/cache.service.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const PAGE_SIZE = 20;

export const listRestaurants = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 5, page = 1, q } = req.query;

  // Text search path — no location cache
  if (q) {
    const results = await Restaurant.find(
      { $text: { $search: q }, isActive: true },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(PAGE_SIZE)
      .lean();
    return sendSuccess(res, 200, 'Search results', { restaurants: results });
  }

  if (!lat || !lng) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'lat and lng are required');
  }

  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  const parsedPage = Math.max(1, parseInt(page, 10));
  const radiusMeters = parseFloat(radius) * 1000;

  const cacheKey = `cache:restaurants:${parsedLat}:${parsedLng}:${radius}:${parsedPage}`;
  const cached = await cacheService.get(cacheKey);
  if (cached) return sendSuccess(res, 200, 'Nearby restaurants', cached);

  const restaurants = await Restaurant.find({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [parsedLng, parsedLat] },
        $maxDistance: radiusMeters,
      },
    },
    isActive: true,
  })
    .skip((parsedPage - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean();

  const data = { restaurants, page: parsedPage };
  await cacheService.set(cacheKey, data, 60);
  sendSuccess(res, 200, 'Nearby restaurants', data);
});

export const getRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({
    _id: req.params.id,
    isActive: true,
  }).lean();
  if (!restaurant) throw new ApiError(404, 'NOT_FOUND', 'Restaurant not found');
  sendSuccess(res, 200, 'Restaurant detail', { restaurant });
});

export const getMenu = asyncHandler(async (req, res) => {
  const menu = await menuService.getMenu(req.params.id);
  sendSuccess(res, 200, 'Menu', { menu });
});

export const getReviews = asyncHandler(async (req, res) => {
  const { page = 1 } = req.query;
  const parsedPage = Math.max(1, parseInt(page, 10));

  const [reviews, total] = await Promise.all([
    Review.find({ restaurantId: req.params.id })
      .sort({ createdAt: -1 })
      .skip((parsedPage - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate('userId', 'name profilePicture')
      .lean(),
    Review.countDocuments({ restaurantId: req.params.id }),
  ]);

  sendSuccess(res, 200, 'Reviews', { reviews, total, page: parsedPage });
});
