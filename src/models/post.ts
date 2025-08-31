import { Types } from "mongoose";
import IRoadmap from "./roadmap";

interface IPost {
  _id: Types.ObjectId;
  // roadmap is fetched only if required, not along with all posts
  roadmap: IRoadmap;
  likes: number;
  views: number;
  authorId: Types.ObjectId;
  createdAt: Date;
}

interface IAuthor {
  authorId: Types.ObjectId;
  username: string;
  email: string;
}

export default IPost;
