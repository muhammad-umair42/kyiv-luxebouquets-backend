import { Router } from "express";
import { isUserAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProductCombinations,
  updateProductDetails,
  updateProductImage,
} from "../controllers/product.controller.js";
const router = Router();

router.route("/").get(isUserAdmin, getAllProducts);
router.route("/product/:id").get(getSingleProduct);
//secure routes
router
  .route("/createproduct")
  .post(isUserAdmin, upload.single("productImage"), createProduct);
router
  .route("/updateproductdetails/:id")
  .post(isUserAdmin, updateProductDetails);
router
  .route("/updateproductcombination/:id")
  .post(isUserAdmin, updateProductCombinations);
router
  .route("/updateproductimage/:id")
  .post(isUserAdmin, upload.single("productImage"), updateProductImage);

router.route("/deleteproduct/:id").post(isUserAdmin, deleteProduct);

export default router;
