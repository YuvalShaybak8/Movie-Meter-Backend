import mongoose from "mongoose";

export interface IUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  profilePic: string;
  my_ratings: string[];
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
  my_ratings: {
    type: [String],
    default: [],
  },
  comments: {
    type: [String],
    default: [],
  },
  tokens: {
    type: [String],
    default: [],
  },
});

export default mongoose.model<IUser>("User", UserSchema);
