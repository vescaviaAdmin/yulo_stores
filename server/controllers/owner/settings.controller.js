import Restaurant from '../../models/Restaurant.js';
import * as uploadService from '../../services/upload.service.js';
import * as cacheService from '../../services/cache.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const invalidateRestaurantCache = (restaurantId) =>
  cacheService.invalidate(`cache:restaurant:${restaurantId}`);

export const getSettings = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'Restaurant settings', { restaurant: req.restaurant });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const { name, description, cuisineTypes, address, settings } = req.body;

  let logoUrl = req.restaurant.logo;
  let bannerUrl = req.restaurant.bannerImage;

  if (req.files?.logo?.[0]) {
    try {
      const { secureUrl } = await uploadService.uploadBuffer({
        buffer: req.files.logo[0].buffer,
        folder: `yulostores/brands/${req.restaurant._id}`,
        publicId: `logo_${Date.now()}`,
      });
      logoUrl = secureUrl;
    } catch {
      throw new ApiError(500, 'UPLOAD_FAILED', 'Logo upload failed');
    }
  }

  if (req.files?.banner?.[0]) {
    try {
      const { secureUrl } = await uploadService.uploadBuffer({
        buffer: req.files.banner[0].buffer,
        folder: `yulostores/brands/${req.restaurant._id}`,
        publicId: `banner_${Date.now()}`,
      });
      bannerUrl = secureUrl;
    } catch {
      throw new ApiError(500, 'UPLOAD_FAILED', 'Banner upload failed');
    }
  }

  const updated = await Restaurant.findByIdAndUpdate(
    req.restaurant._id,
    { $set: { name, description, cuisineTypes, address, settings, logo: logoUrl, bannerImage: bannerUrl } },
    { new: true }
  );

  await invalidateRestaurantCache(req.restaurant._id);
  sendSuccess(res, 200, 'Settings updated', { restaurant: updated });
});

export const getHours = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'Operating hours', { operatingHours: req.restaurant.operatingHours });
});

export const updateHours = asyncHandler(async (req, res) => {
  const { operatingHours } = req.body;
  if (!Array.isArray(operatingHours)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'operatingHours must be an array');
  }
  const updated = await Restaurant.findByIdAndUpdate(
    req.restaurant._id,
    { $set: { operatingHours } },
    { new: true }
  );
  await invalidateRestaurantCache(req.restaurant._id);
  sendSuccess(res, 200, 'Operating hours updated', { operatingHours: updated.operatingHours });
});

export const getDelivery = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'Delivery config', { delivery: req.restaurant.delivery });
});

export const updateDelivery = asyncHandler(async (req, res) => {
  const { radiusKm, baseCharge, freeThreshold, estimatedMinutes } = req.body;
  const updated = await Restaurant.findByIdAndUpdate(
    req.restaurant._id,
    { $set: { delivery: { radiusKm, baseCharge, freeThreshold, estimatedMinutes } } },
    { new: true }
  );
  await invalidateRestaurantCache(req.restaurant._id);
  sendSuccess(res, 200, 'Delivery config updated', { delivery: updated.delivery });
});
