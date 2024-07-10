import mongoose from "mongoose";

export interface IRating {
  _id: string;
  title: string;
  rating: number;
  movie_image: string;
  comments: string[];
  createdAt: Date;
  owner: string;
}

const RatingSchema = new mongoose.Schema<IRating>({
  title: {
    type: String,
    required: true,
  },
  movie_image: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  comments: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  owner: {
    type: String,
    required: true,
  },
});

export default mongoose.model<IRating>("Rating", RatingSchema);
