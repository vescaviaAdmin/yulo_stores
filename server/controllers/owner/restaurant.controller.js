import Restaurant from '../../models/Restaurant.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const createRestaurant = asyncHandler(async (req, res) => {
  const { name, description, cuisineTypes, address, location } = req.body;

  if (!name) throw new ApiError(400, 'VALIDATION_ERROR', 'name is required');

  const coords =
    location?.coordinates?.length === 2 ? location.coordinates : [0, 0];

  const restaurant = await Restaurant.create({
    ownerId: req.user._id,
    name,
    description,
    cuisineTypes: cuisineTypes || [],
    address: address || {},
    location: { type: 'Point', coordinates: coords },
  });

  sendSuccess(res, 201, 'Restaurant created', { restaurant });
});

export const listMyRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find({ ownerId: req.user._id }).lean();
  sendSuccess(res, 200, 'Your restaurants', { restaurants });
});

export const getRestaurant = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'Restaurant', { restaurant: req.restaurant });
});

export const updateRestaurant = asyncHandler(async (req, res) => {
  const allowed = ['name', 'description', 'cuisineTypes', 'address', 'location', 'isActive'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const updated = await Restaurant.findByIdAndUpdate(
    req.restaurant._id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  sendSuccess(res, 200, 'Restaurant updated', { restaurant: updated });
});
