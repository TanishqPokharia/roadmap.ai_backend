import mongoose from "mongoose";
import { roadmapSchema } from "./roadmap";
import IPost from "../models/post";

type PostDocument = mongoose.Document & IPost;

const postSchema = new mongoose.Schema<PostDocument>({
  title: { type: String, required: true, index: true },
  roadmap: {
    type: roadmapSchema,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  author: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model<PostDocument>("Post", postSchema);
export default Post;
