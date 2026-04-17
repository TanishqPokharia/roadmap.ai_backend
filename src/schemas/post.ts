import mongoose from "mongoose";
import { roadmapSchema } from "./roadmap.js";
import IPost from "../models/post.js";
import PostGenre from "../enums/post.genre.js";

export type PostDocument = mongoose.Document & IPost;

const postSchema = new mongoose.Schema<PostDocument>({
  roadmap: {
    type: roadmapSchema,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  bannerImage: {
    type: String,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    ref: "User",
  },
  createdAt: { type: Date, default: Date.now, required: true },
  genre: {
    type: [String],
    enum: Object.values(PostGenre),
    default: [],
    required: true,
  }
});

postSchema.virtual("author", {
  ref: "User",
  localField: "authorId",
  foreignField: "_id",
  justOne: true,
  options: {
    select: "username email avatar",
  }
});

postSchema.virtual("isLiked", {
  ref: "Likes",
  localField: "_id",
  foreignField: "postId",
  justOne: true,
  options: {
    select: "userId"
  }
});

postSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    ret.title = ret.roadmap.title;
    ret.description = ret.roadmap.description;
    if (ret.isLiked) {
      ret.isLiked = true;
    } else {
      ret.isLiked = false;
    }
    delete ret.roadmap;
    delete ret._id;
    return ret;
  }
});

postSchema.set("toObject", { virtuals: true });

const Post = mongoose.model<PostDocument>("Post", postSchema);
export default Post;
