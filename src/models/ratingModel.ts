import mongoose, { Document } from "mongoose";

export interface IRating extends Document {
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
  calculateAverageRating: () => void;
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
  const sumOfOtherRatings = this.ratingOfotherUsers.reduce(
    (sum: any, userRating: { rating: any }) => sum + userRating.rating,
    0
  );
  const totalSum = sumOfOtherRatings + this.rating;
  const totalCount = totalRatings + 1; // Include the owner's rating
  this.averageRating = Math.round((totalSum / totalCount) * 10) / 10; // Round to 1 decimal place
};

RatingSchema.pre("save", function (next) {
  this.calculateAverageRating();
  next();
});

export default mongoose.model<IRating>("Rating", RatingSchema);
