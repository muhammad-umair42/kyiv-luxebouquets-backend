import { Router } from "express";
import { loginUser, registerNewUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerNewUser);
router.route("/login").post(loginUser);

export default router;
