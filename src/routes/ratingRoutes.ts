import express from "express";
const router = express.Router();
import ratingController from "../controllers/ratingController";
import { authMiddleware } from "../controllers/authController";

router.get("/", ratingController.getAll);
router.get("/:id", ratingController.getById);
router.post("/", authMiddleware, ratingController.create);
router.put("/:id", authMiddleware, ratingController.update);
router.delete("/:id", authMiddleware, ratingController.delete);

export default router;
