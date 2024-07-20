import express from "express";
import ratingController from "../controllers/ratingController";
import authController from "../controllers/authController";

const router = express.Router();

/**
 * @swagger
 * /ratings:
 *   get:
 *     summary: Retrieve a list of all ratings
 *     tags: [Ratings]
 *     responses:
 *       200:
 *         description: A list of ratings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   movieId:
 *                     type: string
 *                   rating:
 *                     type: number
 *                   comments:
 *                     type: array
 *                     items:
 *                       type: string
 */
router.get("/", ratingController.getAll);

/**
 * @swagger
 * /ratings/myRatings:
 *   get:
 *     summary: Retrieve a list of user's ratings
 *     tags: [Ratings]
 *     responses:
 *       200:
 *         description: A list of user's ratings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   movieId:
 *                     type: string
 *                   rating:
 *                     type: number
 *                   comments:
 *                     type: array
 *                     items:
 *                       type: string
 */
router.get(
  "/myRatings",
  authController.authMiddleware,
  ratingController.getUserRatings
);

/**
 * @swagger
 * /ratings/{id}:
 *   get:
 *     summary: Retrieve a rating by ID
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The rating ID
 *     responses:
 *       200:
 *         description: A single rating
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 movieId:
 *                   type: string
 *                 rating:
 *                   type: number
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Rating not found
 */
router.get("/:id", ratingController.getById);

/**
 * @swagger
 * /ratings:
 *   post:
 *     summary: Create a new rating
 *     tags: [Ratings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieId:
 *                 type: string
 *               rating:
 *                 type: number
 *               comments:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rating created successfully
 *       400:
 *         description: Invalid data
 */
router.post("/", authController.authMiddleware, ratingController.create);

/**
 * @swagger
 * /ratings/{id}:
 *   put:
 *     summary: Update a rating by ID
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The rating ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rating updated successfully
 *       400:
 *         description: Invalid data
 *       404:
 *         description: Rating not found
 */
router.put("/:id", authController.authMiddleware, ratingController.update);

/**
 * @swagger
 * /ratings/{id}:
 *   delete:
 *     summary: Delete a rating by ID
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The rating ID
 *     responses:
 *       200:
 *         description: Rating deleted successfully
 *       404:
 *         description: Rating not found
 */
router.delete("/:id", authController.authMiddleware, ratingController.delete);

/**
 * @swagger
 * /ratings/{id}/comment:
 *   post:
 *     summary: Add a comment to a rating
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The rating ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Invalid data
 *       404:
 *         description: Rating not found
 */
router.post(
  "/:id/comment",
  authController.authMiddleware,
  ratingController.addComment
);

/**
 * @swagger
 * /ratings/{id}/userRating:
 *   post:
 *     summary: Add a user's rating to a movie
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The rating ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               rating:
 *                 type: number
 *     responses:
 *       201:
 *         description: User rating added successfully
 *       400:
 *         description: Invalid data
 *       404:
 *         description: Rating not found
 */
router.post(
  "/:id/userRating",
  authController.authMiddleware,
  ratingController.addUserRating
);

/**
 * @swagger
 * /ratings/{id}/userRating/{userId}:
 *   get:
 *     summary: Retrieve a user's rating for a movie
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The rating ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User rating retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 rating:
 *                   type: number
 *       404:
 *         description: Rating or user not found
 */
router.get(
  "/:id/userRating/:userId",
  authController.authMiddleware,
  ratingController.getUserRatingForMovie
);

export default router;
