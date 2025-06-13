import { Types } from "mongoose";
import IRoadmap from "./roadmap";

interface IPost {
  _id: Types.ObjectId;
  title: string;
  roadmap: IRoadmap;
  likes: number;
  author: IAuthor;
  createdAt: Date;
}

interface IAuthor {
  username: string;
  email: string;
}

export default IPost;
