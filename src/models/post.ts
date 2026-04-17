import { Types } from "mongoose";
import IRoadmap from "./roadmap.js";
import PostGenre from "../enums/post.genre.js";

interface IPost {
  _id: Types.ObjectId;
  id: string;
  // roadmap is fetched only if required, not along with all posts
  roadmap: IRoadmap;
  title: string;
  description: string;
  likes: number;
  views: number;
  bannerImage?: string;
  authorId: Types.ObjectId;
  createdAt: Date;
  genre: PostGenre[];
}

export default IPost;