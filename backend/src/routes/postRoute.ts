import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware";

import {
  createPost,
  getPosts,
  getPostById,
  commentPost,
  likePost,
  deletePostById,
} from "../controllers/postController";

const router = Router();

router.post("/", authMiddleware, createPost);
router.get("/", getPosts);
router.get("/:id", getPostById);
router.post("/:id/like", authMiddleware, likePost);
router.post("/:id/comment", authMiddleware, commentPost);
router.delete("/:id", authMiddleware, deletePostById);

export default router;
