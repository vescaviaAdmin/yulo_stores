import MenuItem from '../../models/MenuItem.js';
import * as uploadService from '../../services/upload.service.js';
import * as menuService from '../../services/menu.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const extractPublicId = (url) => {
  if (!url) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
  return match ? match[1] : null;
};

export const list = asyncHandler(async (req, res) => {
  const items = await MenuItem.find({ restaurantId: req.restaurant._id }).lean();
  sendSuccess(res, 200, 'Menu items', { items });
});

export const create = asyncHandler(async (req, res) => {
  const { name, description, foodType, sellingPrice, discountedPrice, categoryId,
    subCategoryId, prepTime, ingredients } = req.body;

  let image;
  if (req.file) {
    const { url } = await uploadService.uploadImage(
      req.file.buffer,
      `yulostores/menu/${req.restaurant._id}`
    );
    image = url;
  }

  const item = await MenuItem.create({
    restaurantId: req.restaurant._id,
    categoryId,
    subCategoryId: subCategoryId || undefined,
    name,
    description,
    foodType,
    sellingPrice,
    discountedPrice: discountedPrice ?? null,
    prepTime,
    ingredients: ingredients || [],
    image,
  });

  await menuService.invalidateMenu(req.restaurant._id);
  sendSuccess(res, 201, 'Menu item created', { item });
});

export const getOne = asyncHandler(async (req, res) => {
  const item = await MenuItem.findOne({
    _id: req.params.itemId,
    restaurantId: req.restaurant._id,
  }).lean();
  if (!item) throw new ApiError(404, 'NOT_FOUND', 'Menu item not found');
  sendSuccess(res, 200, 'Menu item', { item });
});

export const update = asyncHandler(async (req, res) => {
  const item = await MenuItem.findOne({
    _id: req.params.itemId,
    restaurantId: req.restaurant._id,
  });
  if (!item) throw new ApiError(404, 'NOT_FOUND', 'Menu item not found');

  let imageUrl = item.image;
  if (req.file) {
    const oldPublicId = extractPublicId(item.image);
    const { url } = await uploadService.uploadImage(
      req.file.buffer,
      `yulostores/menu/${req.restaurant._id}`
    );
    imageUrl = url;
    await uploadService.destroyImage(oldPublicId);
  }

  const updates = { ...req.body, image: imageUrl };
  const updated = await MenuItem.findByIdAndUpdate(item._id, { $set: updates }, { new: true });

  await menuService.invalidateMenu(req.restaurant._id);
  sendSuccess(res, 200, 'Menu item updated', { item: updated });
});

export const remove = asyncHandler(async (req, res) => {
  const item = await MenuItem.findOneAndUpdate(
    { _id: req.params.itemId, restaurantId: req.restaurant._id },
    { $set: { isAvailable: false } },
    { new: true }
  );
  if (!item) throw new ApiError(404, 'NOT_FOUND', 'Menu item not found');
  await menuService.invalidateMenu(req.restaurant._id);
  sendSuccess(res, 200, 'Menu item removed', null);
});

export const toggle = asyncHandler(async (req, res) => {
  const item = await MenuItem.findOne({
    _id: req.params.itemId,
    restaurantId: req.restaurant._id,
  });
  if (!item) throw new ApiError(404, 'NOT_FOUND', 'Menu item not found');

  item.isAvailable = !item.isAvailable;
  await item.save();
  await menuService.invalidateMenu(req.restaurant._id);
  sendSuccess(res, 200, 'Availability toggled', { isAvailable: item.isAvailable });
});

export const updateIngredients = asyncHandler(async (req, res) => {
  const { ingredients } = req.body;
  const item = await MenuItem.findOneAndUpdate(
    { _id: req.params.itemId, restaurantId: req.restaurant._id },
    { $set: { ingredients } },
    { new: true }
  );
  if (!item) throw new ApiError(404, 'NOT_FOUND', 'Menu item not found');
  sendSuccess(res, 200, 'Ingredients updated', { item });
});
