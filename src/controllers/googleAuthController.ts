import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import User, { IUser } from "../models/userModel";
import { generateTokens } from "./authController";
import { Document } from "mongoose";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleSignin = async (req: Request, res: Response) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).send("Invalid Google credentials");
    }

    const username = payload.name || payload.email.split("@")[0];

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        email: payload.email,
        username: username,
        profilePic: "avatar.jpg",
        password: "google-signin",
        my_ratings: [],
        comments: [],
        tokens: [],
      });
    }

    const tokens = await generateTokens(
      user as Document<unknown, object, IUser> &
        IUser &
        Required<{ _id: string }>
    );
    if (!tokens) {
      return res.status(400).send("Error generating tokens");
    }

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      my_ratings: user.my_ratings,
      comments: user.comments,
    };

    return res.status(200).json({
      user: userResponse,
      ...tokens,
    });
  } catch (err) {
    console.error("Google sign-in error:", err);
    return res.status(400).send("Google sign-in failed");
  }
};
