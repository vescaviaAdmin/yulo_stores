import { Router } from 'express';
import {
  listCategories, createCategory, updateCategory, deleteCategory,
  listSubCategories, createSubCategory, updateSubCategory, deleteSubCategory,
} from '../../controllers/owner/category.controller.js';

const router = Router({ mergeParams: true });

router.get('/', listCategories);
router.post('/', createCategory);
router.patch('/:cId', updateCategory);
router.delete('/:cId', deleteCategory);

router.get('/:cId/subcategories', listSubCategories);
router.post('/:cId/subcategories', createSubCategory);
router.patch('/:cId/subcategories/:sId', updateSubCategory);
router.delete('/:cId/subcategories/:sId', deleteSubCategory);

export default router;
