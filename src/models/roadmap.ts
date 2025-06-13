import { Types } from "mongoose";
import IRoadmapGoal from "./roadmap.goal";

interface IRoadmap {
  _id: Types.ObjectId;
  title: string;
  goals: IRoadmapGoal[];
  userId: Types.ObjectId;
  status: {
    completed: boolean;
    completedAt: Date | null;
  };
}

export default IRoadmap;
