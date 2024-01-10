import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  getAllCategory,
  getSimilarCategoryProducts,
  getSingleCategoryProducts,
  updateCategoryImage,
  updateCategoryProduct,
} from '../controllers/category.controller.js';
import { isUserAdmin } from '../middlewares/auth.middleware.js';
import { upload } from './../middlewares/multer.middleware.js';
const router = Router();

router.route('/').get(getAllCategory);
router.route('/category/:id').get(getSingleCategoryProducts);
router.route('/category/similarproducts/:id').get(getSimilarCategoryProducts);
//secure routes
router
  .route('/createcategory')
  .post(isUserAdmin, upload.single('categoryImage'), createCategory);
router
  .route('/updatecategoryproducts/:id')
  .post(isUserAdmin, updateCategoryProduct);

router
  .route('/updatecategoryimage/:id')
  .post(isUserAdmin, upload.single('categoryImage'), updateCategoryImage);

router.route('/deletecategory/:id').post(isUserAdmin, deleteCategory);
export default router;
