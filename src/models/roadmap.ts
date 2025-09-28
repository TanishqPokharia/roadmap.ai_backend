import { Types } from "mongoose";
import IRoadmapGoal from "./roadmap.goal";

interface IRoadmap {
  _id: Types.ObjectId;
  id: string;
  title: string;
  description: string;
  postId: Types.ObjectId | null;
  goals: IRoadmapGoal[];
  userId: Types.ObjectId;
  status: {
    completed: boolean;
    completedAt: Date | null;
  };
}

export default IRoadmap;
