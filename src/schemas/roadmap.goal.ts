import mongoose from "mongoose";
import PublicRoadmapSubgoal from "./public.roadmap.subgoal";

const roadmapGoalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subgoals: {
    type: [PublicRoadmapSubgoal],
    required: true,
  },
});

const RoadmapGoal = mongoose.model("RoadmapGoal", roadmapGoalSchema);
export default RoadmapGoal;
