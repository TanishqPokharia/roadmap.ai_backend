import { Types } from "mongoose";
import IRoadmapSubgoal from "./roadmap.subgoal";

interface IRoadmapGoal {
  _id: Types.ObjectId;
  title: string;
  subgoals: IRoadmapSubgoal[];
}

export default IRoadmapGoal;
