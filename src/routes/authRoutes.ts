import express from "express";
const router = express.Router();
import authController from "../controllers/authController";
import { googleSignin } from "../controllers/googleAuthController";

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/refresh", authController.refresh);
router.get("/logout", authController.logout);
router.post("/google", googleSignin);

export default router;
