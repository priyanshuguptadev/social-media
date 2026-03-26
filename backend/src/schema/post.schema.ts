import { z } from "zod";

export const createPostSchema = z.object({
  content: z.string().optional(),
  image: z.string().optional(),
});

export const commentPostSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

export const deleteCommentSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  commentId: z.string().min(1, "Comment ID is required"),
});
