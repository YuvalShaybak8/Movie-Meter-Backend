import express from "express";
const router = express.Router();
import userController from "../controllers/userController";

router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);

export default router;
