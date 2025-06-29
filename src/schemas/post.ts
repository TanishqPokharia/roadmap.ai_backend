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
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    ref: "User",
  },
  createdAt: { type: Date, default: Date.now },
});

postSchema.virtual("author", {
  ref: "User",
  localField: "authorId",
  foreignField: "_id",
  justOne: true,
});

postSchema.set("toJSON", {
  virtuals: true,
});

const Post = mongoose.model<PostDocument>("Post", postSchema);
export default Post;
