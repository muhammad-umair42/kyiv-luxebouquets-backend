import { Router } from "express";
import {
  deleteUser,
  enableOrDisableSpecialEmails,
  getAllUsers,
  getUserById,
  loginUser,
  logoutUser,
  registerNewUser,
  updateUserDetails,
  updateUserPassword,
  updateUserProfilePicture,
  userForgotPassword,
} from "../controllers/user.controller.js";
import {
  isRequestAuthorized,
  isUserAdmin,
} from "./../middlewares/auth.middleware.js";
import { upload } from "./../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(registerNewUser);

router.route("/login").post(loginUser);

router.route("/forgotpassword").post(userForgotPassword);

//secured routes
router.route("/logout").post(isRequestAuthorized, logoutUser);

router.route("/getallusers").get(isUserAdmin, getAllUsers);

router.route("/user/:id").get(isRequestAuthorized, getUserById);

router
  .route("/user/updateprofilepicture")
  .post(
    isRequestAuthorized,
    upload.single("profilePicture"),
    updateUserProfilePicture,
  );

router.route("/updateuser").post(isRequestAuthorized, updateUserDetails);

router.route("/updatepassword").post(isRequestAuthorized, updateUserPassword);

router
  .route("/updatespecialemails")
  .post(isRequestAuthorized, enableOrDisableSpecialEmails);

router.route("/deleteuser/:id").post(isUserAdmin, deleteUser);

export default router;
