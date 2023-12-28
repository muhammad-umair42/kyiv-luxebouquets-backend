import { Router } from "express";
import { isUserAdmin } from "../middlewares/auth.middleware.js";
import {
  createCategory,
  deleteCategory,
  getAllCategory,
  getSingleCategoryProducts,
  updateCategoryImage,
  updateCategoryProduct,
} from "../controllers/category.controller.js";
import { upload } from "./../middlewares/multer.middleware.js";
const router = Router();

router.route("/").get(getAllCategory);
router.route("/category/:id").get(getSingleCategoryProducts);
//secure routes
router
  .route("/createcategory")
  .post(isUserAdmin, upload.single("categoryImage"), createCategory);
router
  .route("/updatecategoryproducts/:id")
  .post(isUserAdmin, updateCategoryProduct);

router
  .route("/updatecategoryimage/;id")
  .post(isUserAdmin, upload.single("categoryImage"), updateCategoryImage);

router.route("/deletecategory/:id").post(isUserAdmin, deleteCategory);
export default router;
