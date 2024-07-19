import express from "express";
const router = express.Router();
import userController from "../controllers/userController";
import authController from "../controllers/authController";

router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", authController.authMiddleware, userController.updateUser);

export default router;
