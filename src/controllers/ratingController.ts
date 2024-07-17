import { Request, Response } from "express";
import Rating, { IRating } from "../models/ratingModel";
import User from "../models/userModel";
import { AuthRequest } from "./authController";
import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

class RatingController {
  async create(req: AuthRequest, res: Response) {
    upload.single("movie_image")(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        console.error("Multer error:", err);
        return res.status(500).json(err);
      } else if (err) {
        console.error("Unknown error:", err);
        return res.status(500).json(err);
      }

      const { title, rating } = req.body;
      const user = req.user._id;
      const movie_image = req.file ? req.file.filename : null;

      console.log("Received data:", {
        title,
        rating,
        user,
        movie_image,
      });

      try {
        const newRating = await Rating.create({
          title,
          rating: Number(rating),
          movie_image,
          owner: user,
          ratingOfotherUsers: [],
        });

        newRating.calculateAverageRating();
        await newRating.save();

        const updatedUser = await User.findByIdAndUpdate(
          user,
          {
            $push: {
              my_ratings: {
                _id: newRating._id,
                title: newRating.title,
                rating: newRating.rating,
                movie_image: newRating.movie_image,
                createdAt: newRating.createdAt,
                averageRating: newRating.averageRating,
              },
            },
          },
          { new: true }
        );

        console.log("Created rating:", newRating);
        res.status(201).json(newRating);
      } catch (err: any) {
        console.error("Error creating rating:", err);
        res.status(500).send(err.message);
      }
    });
  }

  async getAll(req: Request, res: Response) {
    try {
      const ratings = await Rating.find().populate("owner", "username").lean();
      ratings.forEach((rating) => {
        rating.commentsCount = rating.comments.length;
      });
      res.status(200).json(ratings);
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  }

  getUserRatings = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user._id;
      const ratings = await Rating.find({ owner: userId }).lean();
      ratings.forEach((rating) => {
        rating.commentsCount = rating.comments.length;
      });
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching user ratings:", error);
      res.status(500).json({ message: "Error fetching user ratings" });
    }
  };

  async getById(req: Request, res: Response) {
    try {
      const rating = await Rating.findById(req.params.id);
      if (!rating) {
        return res.status(404).send("Rating not found");
      }
      res.status(200).json(rating);
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  }

  async update(req: AuthRequest, res: Response) {
    upload.single("movie_image")(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        console.error("Multer error:", err);
        return res.status(500).json(err);
      } else if (err) {
        console.error("Unknown error:", err);
        return res.status(500).json(err);
      }

      const { rating, title } = req.body;
      const movie_image = req.file ? req.file.filename : undefined;

      try {
        const oldRating = await Rating.findById(req.params.id);
        if (!oldRating) {
          return res.status(404).send("Rating not found");
        }

        const updatedFields: any = { rating: Number(rating), title };
        if (movie_image) {
          updatedFields.movie_image = movie_image;
          // Delete old image
          if (oldRating.movie_image) {
            const oldImagePath = path.join("uploads", oldRating.movie_image);
            fs.unlink(oldImagePath, (err) => {
              if (err) console.error("Error deleting old image:", err);
            });
          }
        }

        const updatedRating = await Rating.findByIdAndUpdate(
          req.params.id,
          updatedFields,
          { new: true }
        );

        // Update user's my_ratings
        await User.updateOne(
          { _id: req.user._id, "my_ratings._id": req.params.id },
          {
            $set: {
              "my_ratings.$.title": updatedRating.title,
              "my_ratings.$.rating": updatedRating.rating,
              "my_ratings.$.movie_image": updatedRating.movie_image,
            },
          }
        );

        res.status(200).json(updatedRating);
      } catch (err: any) {
        res.status(500).send(err.message);
      }
    });
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const rating = await Rating.findById(req.params.id);
      if (!rating) {
        return res.status(404).send("Rating not found");
      }

      // Delete the image file
      if (rating.movie_image) {
        const imagePath = path.join("uploads", rating.movie_image);
        fs.unlink(imagePath, (err) => {
          if (err) console.error("Error deleting image file:", err);
        });
      }

      await Rating.findByIdAndDelete(req.params.id);

      // Remove rating from user's my_ratings
      await User.updateOne(
        { _id: req.user._id },
        { $pull: { my_ratings: { _id: req.params.id } } }
      );

      res.status(200).send("Rating deleted successfully");
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  }

  async addComment(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user._id;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send("User not found");
      }

      const updatedRating = await Rating.findByIdAndUpdate(
        id,
        {
          $push: {
            comments: {
              userId,
              username: user.username,
              comment,
              createdAt: new Date(),
            },
          },
        },
        { new: true }
      ).populate("comments.userId", "username");

      if (!updatedRating) {
        return res.status(404).send("Rating not found");
      }

      await User.findByIdAndUpdate(userId, {
        $push: {
          comments: {
            ratingId: updatedRating._id,
            comment,
            createdAt: new Date(),
          },
        },
      });

      res.status(200).json(updatedRating);
    } catch (err: any) {
      console.error("Error adding comment:", err);
      res.status(500).send(err.message);
    }
  }

  async addUserRating(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user._id;

    try {
      const ratingDoc = await Rating.findById(id);
      if (!ratingDoc) {
        return res.status(404).send("Rating not found");
      }

      if (ratingDoc.owner.toString() === userId.toString()) {
        return res.status(400).send("You can't rate your own movie");
      }

      const existingRatingIndex = ratingDoc.ratingOfotherUsers.findIndex(
        (r) => r.userId.toString() === userId.toString()
      );

      if (existingRatingIndex !== -1) {
        return res.status(400).send("You have already rated this movie");
      }

      ratingDoc.ratingOfotherUsers.push({ userId, rating: Number(rating) });
      ratingDoc.calculateAverageRating();
      await ratingDoc.save();

      res.status(200).json({ averageRating: ratingDoc.averageRating });
    } catch (err: any) {
      console.error("Error adding user rating:", err);
      res.status(500).send(err.message);
    }
  }

  async getUserRatingForMovie(req: AuthRequest, res: Response) {
    const { id: movieId, userId } = req.params;
    try {
      const rating = await Rating.findById(movieId);
      if (!rating) {
        return res.status(404).send("Rating not found");
      }
      const userRating = rating.ratingOfotherUsers.find(
        (r) => r.userId.toString() === userId
      );
      if (userRating) {
        res.status(200).json({ rating: userRating.rating });
      } else {
        res.status(200).json({ rating: 0 });
      }
    } catch (err: any) {
      console.error("Error fetching user rating for movie:", err);
      res.status(500).send(err.message);
    }
  }
}

export default new RatingController();
