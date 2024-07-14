import express from "express";
import ratingController from "../controllers/ratingController";
import { authMiddleware } from "../controllers/authController";

const router = express.Router();

router.get("/", ratingController.getAll);
router.get("/myRatings", authMiddleware, ratingController.getUserRatings);
router.get("/:id", ratingController.getById);
router.post("/", authMiddleware, ratingController.create);
router.put("/:id", authMiddleware, ratingController.update);
router.delete("/:id", authMiddleware, ratingController.delete);

export default router;
