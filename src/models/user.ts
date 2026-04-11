import { Types } from "mongoose";

interface IUser {
  _id: Types.ObjectId;
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  avatar: string | null;
  provider: string; // default, google
  providerId: string;
}

export default IUser;
