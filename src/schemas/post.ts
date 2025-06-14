import mongoose from "mongoose";
import { roadmapSchema } from "./roadmap";
import IPost from "../models/post";

type PostDocument = mongoose.Document & IPost;

const postSchema = new mongoose.Schema<PostDocument>({
  roadmap: {
    type: roadmapSchema,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  author: {
    type: new mongoose.Schema({
      username: { type: String, required: true },
      email: { type: String, required: true },
    }),
    required: true,
    ref: "User",
  },
  createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model<PostDocument>("Post", postSchema);
export default Post;
