import { ApiError } from '../utils/ApiError.js';

export const authorizeStaffRestaurant = (req, res, next) => {
  if (req.staff.restaurantId.toString() !== req.params.restaurantId) {
    throw new ApiError(403, 'WRONG_RESTAURANT', 'Staff token does not match this restaurant');
  }
  next();
};
