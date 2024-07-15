import mongoose from "mongoose";

export interface IRating {
  _id: string;
  title: string;
  rating: number;
  movie_image: string;
  createdAt: Date;
  owner: string;
  comments: Array<{
    userId: mongoose.Types.ObjectId;
    username: string;
    comment: string;
    createdAt: Date;
  }>;
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  owner: {
    type: String,
    required: true,
  },
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      username: { type: String, required: true },
      comment: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model<IRating>("Rating", RatingSchema);
