import mongoose from "mongoose";
import { roadmapSubgoalSchema } from "./roadmap.subgoal";
import IRoadmapGoal from "../models/roadmap.goal";

type RoadmapGoalDocument = mongoose.Document & IRoadmapGoal;

export const roadmapGoalSchema = new mongoose.Schema<RoadmapGoalDocument>({
  title: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 100,
  },
  subgoals: {
    type: [roadmapSubgoalSchema],
    required: true,
  },
});

const RoadmapGoal = mongoose.model<RoadmapGoalDocument>(
  "RoadmapGoal",
  roadmapGoalSchema
);
export default RoadmapGoal;
