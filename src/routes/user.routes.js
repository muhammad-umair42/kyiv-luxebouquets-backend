import { Router } from "express";
import { registerNewUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerNewUser);

export default router;
