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
  ratingOfotherUsers: Array<{
    userId: mongoose.Types.ObjectId;
    rating: number;
  }>;
  averageRating: number;
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
  ratingOfotherUsers: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, required: true },
    },
  ],
  averageRating: {
    type: Number,
    default: 0,
  },
});

RatingSchema.methods.calculateAverageRating = function () {
  const totalRatings = this.ratingOfotherUsers.length;
  if (totalRatings === 0) {
    this.averageRating = this.rating;
  } else {
    const sum = this.ratingOfotherUsers.reduce((a, b) => a + b.rating, 0);
    this.averageRating = (sum + this.rating) / (totalRatings + 1);
  }
};

RatingSchema.pre("save", function (next) {
  this.calculateAverageRating();
  next();
});

export default mongoose.model<IRating>("Rating", RatingSchema);
