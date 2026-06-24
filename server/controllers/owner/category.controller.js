import Category from '../../models/Category.js';
import SubCategory from '../../models/SubCategory.js';
import * as menuService from '../../services/menu.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ restaurantId: req.restaurant._id })
    .sort({ displayOrder: 1 })
    .lean();
  sendSuccess(res, 200, 'Categories', { categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, displayOrder } = req.body;
  const category = await Category.create({
    restaurantId: req.restaurant._id,
    name,
    displayOrder: displayOrder ?? 0,
  });
  await menuService.invalidateMenu(req.restaurant._id);
  sendSuccess(res, 201, 'Category created', { category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndUpdate(
    { _id: req.params.cId, restaurantId: req.restaurant._id },
    { $set: req.body },
    { new: true }
  );
  if (!category) throw new ApiError(404, 'NOT_FOUND', 'Category not found');
  await menuService.invalidateMenu(req.restaurant._id);
  sendSuccess(res, 200, 'Category updated', { category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndDelete({
    _id: req.params.cId,
    restaurantId: req.restaurant._id,
  });
  if (!category) throw new ApiError(404, 'NOT_FOUND', 'Category not found');
  await menuService.invalidateMenu(req.restaurant._id);
  sendSuccess(res, 200, 'Category deleted', null);
});

export const listSubCategories = asyncHandler(async (req, res) => {
  const subs = await SubCategory.find({ categoryId: req.params.cId })
    .sort({ displayOrder: 1 })
    .lean();
  sendSuccess(res, 200, 'Sub-categories', { subCategories: subs });
});

export const createSubCategory = asyncHandler(async (req, res) => {
  const { name, displayOrder } = req.body;
  const sub = await SubCategory.create({
    restaurantId: req.restaurant._id,
    categoryId: req.params.cId,
    name,
    displayOrder: displayOrder ?? 0,
  });
  await menuService.invalidateMenu(req.restaurant._id);
  sendSuccess(res, 201, 'Sub-category created', { subCategory: sub });
});

export const updateSubCategory = asyncHandler(async (req, res) => {
  const sub = await SubCategory.findOneAndUpdate(
    { _id: req.params.sId, categoryId: req.params.cId },
    { $set: req.body },
    { new: true }
  );
  if (!sub) throw new ApiError(404, 'NOT_FOUND', 'Sub-category not found');
  await menuService.invalidateMenu(req.restaurant._id);
  sendSuccess(res, 200, 'Sub-category updated', { subCategory: sub });
});

export const deleteSubCategory = asyncHandler(async (req, res) => {
  const sub = await SubCategory.findOneAndDelete({
    _id: req.params.sId,
    categoryId: req.params.cId,
  });
  if (!sub) throw new ApiError(404, 'NOT_FOUND', 'Sub-category not found');
  await menuService.invalidateMenu(req.restaurant._id);
  sendSuccess(res, 200, 'Sub-category deleted', null);
});
