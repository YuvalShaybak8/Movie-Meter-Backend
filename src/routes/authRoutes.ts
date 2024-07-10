import express from "express";
const router = express.Router();
import authController from "../controllers/authController";

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/refresh", authController.refresh);
router.get("/logout", authController.logout);

export default router;
