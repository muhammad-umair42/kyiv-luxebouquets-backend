import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerNewUser,
} from "../controllers/user.controller.js";
import { isRequestAuthorized } from "./../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerNewUser);
router.route("/login").post(loginUser);
router.route("/logout").post(isRequestAuthorized, logoutUser);

export default router;
