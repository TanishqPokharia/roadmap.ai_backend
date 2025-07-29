import { Types } from "mongoose";

interface IRoadmapSubgoal {
  _id: Types.ObjectId;
  resources: string[];
  description: string;
  duration: string;
  title: string;
  status: {
    completed: boolean;
    completedAt: Date | null;
  };
}

export default IRoadmapSubgoal;
