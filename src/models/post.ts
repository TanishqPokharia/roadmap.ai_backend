import { Types } from "mongoose";
import IRoadmap from "./roadmap";

interface IPost {
  _id: Types.ObjectId;
  roadmap: IRoadmap;
  likes: number;
  authorId: Types.ObjectId;
  createdAt: Date;
}

interface IAuthor {
  authorId: Types.ObjectId;
  username: string;
  email: string;
}

export default IPost;
