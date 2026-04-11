import { Types } from "mongoose";
import IRoadmapSubgoal from "./roadmap.subgoal.js";

interface IRoadmapGoal {
  _id: Types.ObjectId;
  title: string;
  subgoals: IRoadmapSubgoal[];
}

export default IRoadmapGoal;
