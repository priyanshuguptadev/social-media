import type { Response } from "express";
import { ZodError } from "zod";

import type { AuthenticatedRequest } from "../types/request";
import { Post } from "../models/post";
import { createPostSchema, commentPostSchema } from "../schema/post.schema";

export const createPost = async (req: AuthenticatedRequest, res: Response) => {
  // Create a new post
  try {
    const { content, image } = createPostSchema.parse(req.body);
    if (!content && !image) {
      return res.status(400).json({ error: "Content or image is required" });
    }
    const userId = req.userId;
    const post = await Post.create({
      content,
      image,
      user: userId,
    });
    res.status(201).json(post);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deletePostById = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  // Delete a post by ID
  try {
    const postId = req.params.id;
    const userId = req.userId;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.user.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await Post.findByIdAndDelete(postId);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPosts = async (req: AuthenticatedRequest, res: Response) => {
  // Get all recent posts with pagination
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const posts = await Post.find({})
      .populate("user", "name username")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPostById = async (req: AuthenticatedRequest, res: Response) => {
  // Get a single post by ID
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId)
      .populate("user", "name username")
      .populate("comments.user", "name username");
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const likePost = async (req: AuthenticatedRequest, res: Response) => {
  // Like or unlike a post
  try {
    const postId = req.params.id;
    const username = req.username;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (!username) {
      return res.status(400).json({ error: "Unauthorized request" });
    }
    const index = post.likes.indexOf(username);
    if (index === -1) {
      post.likes.push(username);
    } else {
      post.likes.splice(index, 1);
    }
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const commentPost = async (req: AuthenticatedRequest, res: Response) => {
  // Post a comment on a post
  try {
    const postId = req.params.id;
    const { content } = commentPostSchema.parse(req.body);
    const userId = req.userId;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    post.comments.push({ content, user: userId });
    await post.save();
    res.json(post);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};
