import mongoose from "mongoose";
import PublicRoadmapSubgoal from "./public.roadmap.subgoal";

const privateRoadmapSubgoalSchema = new mongoose.Schema({
  subgoal: {
    type: PublicRoadmapSubgoal,
    required: true,
  },
  done: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const PrivateRoadmapSubgoalSchema = mongoose.model(
  "PrivateRoadmapSubgoal",
  privateRoadmapSubgoalSchema
);
export default PrivateRoadmapSubgoalSchema;
