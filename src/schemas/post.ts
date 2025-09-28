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
  createdAt: { type: Date, default: Date.now },
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

postSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    ret.title = ret.roadmap.title;
    ret.description = ret.roadmap.description;
    delete ret.roadmap;
    delete ret._id;
    return ret;
  }
});

postSchema.set("toObject", { virtuals: true });

const Post = mongoose.model<PostDocument>("Post", postSchema);
export default Post;
