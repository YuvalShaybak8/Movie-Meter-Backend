import { Request, Response } from "express";
import Rating, { IRating } from "../models/ratingModel";
import { AuthRequest } from "./authController";

class RatingController {
  async getAll(req: Request, res: Response) {
    try {
      const ratings = await Rating.find();
      res.status(200).json(ratings);
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  }

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

  async create(req: AuthRequest, res: Response) {
    const { movieId, rating, comment } = req.body;
    const user = req.user._id;
    try {
      const newRating = await Rating.create({
        ownerId: user,
        movieId,
        rating,
        comments: [comment],
      });
      res.status(201).json(newRating);
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
}

export default new RatingController();
