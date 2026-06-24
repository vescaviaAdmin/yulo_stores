import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';
import SubCategory from '../models/SubCategory.js';
import * as cacheService from './cache.service.js';

export const getMenu = async (restaurantId) => {
  const cacheKey = `cache:menu:${restaurantId}`;

  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;

  const [items, categories, subcategories] = await Promise.all([
    MenuItem.find({ restaurantId, isAvailable: true }).lean(),
    Category.find({ restaurantId }).sort({ displayOrder: 1 }).lean(),
    SubCategory.find({ restaurantId }).lean(),
  ]);

  const grouped = categories.map((cat) => ({
    ...cat,
    subCategories: subcategories
      .filter((s) => s.categoryId.equals(cat._id))
      .map((sub) => ({
        ...sub,
        items: items.filter((i) => i.subCategoryId?.equals(sub._id)),
      })),
    items: items.filter((i) => i.categoryId.equals(cat._id) && !i.subCategoryId),
  }));

  await cacheService.set(cacheKey, grouped, 300);
  return grouped;
};

export const invalidateMenu = (restaurantId) =>
  cacheService.invalidate(`cache:menu:${restaurantId}`);
