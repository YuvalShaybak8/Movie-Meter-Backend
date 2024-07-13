import { Request, Response } from "express";
import User, { IUser } from "../models/userModel";
import bcrypt from "bcrypt";

const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).json(user);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
};

const updateUser = async (req: Request, res: Response) => {
  const { email, password, username, profilePic, my_ratings, comments } =
    req.body;
  try {
    if (password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(password, salt);
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { email, password, username, profilePic, my_ratings, comments },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).send("User not found");
    }
    res.status(200).json(updatedUser);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
};

export default { getUsers, getUserById, updateUser };
