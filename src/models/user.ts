import { Types } from "mongoose";

interface IUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  avatar: string | null;
}

export default IUser;
