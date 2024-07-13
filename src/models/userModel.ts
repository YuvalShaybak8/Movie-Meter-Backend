import mongoose from "mongoose";

export interface IUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  profilePic: string;
  my_ratings: Array<{
    _id: mongoose.Types.ObjectId;
    title: string;
    rating: number;
    movie_image: string;
    createdAt: Date;
  }>;
  comments: string[];
  tokens: string[];
}

const UserSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    default: "/avatar.jpg", // Default profile picture
  },
  my_ratings: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Rating" },
      title: String,
      rating: Number,
      movie_image: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  comments: {
    type: [String],
    default: [],
  },
  tokens: {
    type: [String],
  },
});

export default mongoose.model<IUser>("User", UserSchema);
