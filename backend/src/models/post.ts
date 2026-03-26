import mongoose from "mongoose";
import { User } from "./user";
import { commentSchema } from "./comment";

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    image: {
      type: String,
    },
    likes: [
      {
        type: String,
      },
    ],
    comments: [commentSchema],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Post = mongoose.model("Post", postSchema);

export { Post };
