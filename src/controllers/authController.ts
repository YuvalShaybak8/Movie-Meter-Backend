import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/userModel";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Document } from "mongoose";

// Function to generate access and refresh tokens
export const generateTokens = async (user: IUser & Document) => {
  const accessToken = jwt.sign(
    { _id: user._id, username: user.username },
    process.env.TOKEN_SECRET!,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION }
  );
  const refreshToken = jwt.sign(
    { _id: user._id, username: user.username },
    process.env.TOKEN_SECRET!,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION }
  );

  user.tokens.push(refreshToken);
  await user.save();

  return { accessToken, refreshToken };
};

const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (!email || !password || !username) {
    return res.status(400).send("Username, email, and password are required");
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      profilePic: "avatar.jpg",
      my_ratings: [],
      comments: [],
      tokens: [],
    });

    const tokens = await generateTokens(newUser);
    if (!tokens) {
      return res.status(400).send("Error generating tokens");
    }

    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      profilePic: newUser.profilePic,
      my_ratings: newUser.my_ratings,
      comments: newUser.comments,
    };

    console.log("User registered:", userResponse);

    return res.status(201).json({
      user: userResponse,
      ...tokens,
    });
  } catch (err) {
    return res.status(400).send((err as Error).message);
  }
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("Email & Password", email, password);
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("User does not exist");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials");
    }
    const tokens = await generateTokens(user);
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

    console.log("User logged in:", userResponse);

    return res.status(200).json({
      user: userResponse,
      ...tokens,
    });
  } catch (err: any) {
    return res.status(400).send(err.message);
  }
};

const refresh = async (req: Request, res: Response) => {
  const refreshToken = extractToken(req);
  if (!refreshToken) {
    return res.sendStatus(401);
  }
  try {
    jwt.verify(refreshToken, process.env.TOKEN_SECRET!, async (err, data) => {
      if (err || !data) {
        return res.sendStatus(403);
      }

      const user = await User.findOne({
        _id: (data as JwtPayload)._id,
      });
      if (!user) {
        return res.sendStatus(403);
      }
      if (!user.tokens.includes(refreshToken)) {
        user.tokens = [];
        await user.save();
        return res.sendStatus(403);
      }
      user.tokens = user.tokens.filter((token) => token !== refreshToken);
      const tokens = await generateTokens(user);
      if (!tokens) {
        return res.status(400).send("Error generating tokens");
      }
      return res.status(200).json(tokens);
    });
  } catch (err) {
    return res.status(400).send((err as Error).message);
  }
};

const extractToken = (req: Request): string | undefined => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  return token;
};

const logout = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).send("No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as JwtPayload;
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.sendStatus(403);
    }

    user.tokens = user.tokens.filter((t) => t !== token);
    await user.save();

    console.log("Logout successful, tokens removed");
    return res.status(200).send();
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(403).send("Invalid token");
  }
};

export interface AuthRequest extends Request {
  user?: { _id: string };
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = extractToken(req);
  if (!token) {
    return res.sendStatus(401);
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as JwtPayload;
    if (!decoded._id) {
      return res.sendStatus(401);
    }
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.sendStatus(401);
    }
    (req as AuthRequest).user = { _id: user._id.toString() };
    return next();
  } catch (err) {
    return res.sendStatus(401);
  }
};

export default {
  register,
  login,
  logout,
  generateTokens,
  authMiddleware,
  refresh,
};
