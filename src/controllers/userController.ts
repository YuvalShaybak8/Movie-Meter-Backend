import { Request, Response } from "express";
import User, { IUser } from "../models/userModel";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

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
  upload.single("profilePic")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: "Error uploading file" });
    }

    const { username } = req.body;
    const profilePic = req.file ? req.file.filename : undefined;

    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { username, ...(profilePic && { profilePic }) },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).send("User not found");
      }

      res.status(200).json(updatedUser);
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  });
};

export default { getUsers, getUserById, updateUser };
