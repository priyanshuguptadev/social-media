import type { Request, Response } from "express";
import { ZodError } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { loginSchema, registerSchema } from "../schema/auth.schema";
import { User } from "../models/user";
import { config } from "../config";
import { Post } from "../models/post";
import type { AuthenticatedRequest } from "../types/request";

const { jwtSecret } = config;

export const login = async (req: Request, res: Response) => {
  // Login an existing user
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      jwtSecret,
      {
        expiresIn: "7d",
      },
    );
    res.json({ token });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const register = async (req: Request, res: Response) => {
  // Register a new user
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split("@")[0];
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      jwtSecret,
      {
        expiresIn: "7d",
      },
    );
    res.status(201).json({ token });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  // Get the authenticated user's profile
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const posts = await Post.find({ user: userId });
    res.json({ user, posts });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
