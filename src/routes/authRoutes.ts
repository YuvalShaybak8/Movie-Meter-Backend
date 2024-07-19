import express from "express";
const router = express.Router();
import authController from "../controllers/authController";
import { googleSignin } from "../controllers/googleAuthController";

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/refresh", authController.refresh);
router.post("/google", googleSignin);

export default router;
