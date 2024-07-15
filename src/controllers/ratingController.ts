import { Request, Response } from "express";
import Rating, { IRating } from "../models/ratingModel";
import User from "../models/userModel";
import { AuthRequest } from "./authController";
import multer from "multer";

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
        });

        // Update user's my_ratings array with the new rating object
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
                // Add any other fields you want to include
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

  async update(req: Request, res: Response) {
    const { rating, comment } = req.body;
    try {
      const updatedRating = await Rating.findByIdAndUpdate(
        req.params.id,
        { rating, $push: { comments: comment } },
        { new: true }
      );
      res.status(200).json(updatedRating);
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await Rating.findByIdAndDelete(req.params.id);
      res.status(200).send();
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

      // Update the user's comments array
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
}

export default new RatingController();
