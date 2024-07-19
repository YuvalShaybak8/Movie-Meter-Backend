import express from "express";
import ratingController from "../controllers/ratingController";
import authController from "../controllers/authController";

const router = express.Router();

router.get("/", ratingController.getAll);
router.get(
  "/myRatings",
  authController.authMiddleware,
  ratingController.getUserRatings
);
router.get("/:id", ratingController.getById);
router.post("/", authController.authMiddleware, ratingController.create);
router.put("/:id", authController.authMiddleware, ratingController.update);
router.delete("/:id", authController.authMiddleware, ratingController.delete);
router.post(
  "/:id/comment",
  authController.authMiddleware,
  ratingController.addComment
);
router.post(
  "/:id/userRating",
  authController.authMiddleware,
  ratingController.addUserRating
);
router.get(
  "/:id/userRating/:userId",
  authController.authMiddleware,
  ratingController.getUserRatingForMovie
);

export default router;
