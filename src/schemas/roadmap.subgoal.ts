import mongoose from "mongoose";
import IRoadmapSubgoal from "../models/roadmap.subgoal";

type IRoadmapSubgoalDocument = mongoose.Document & IRoadmapSubgoal;

export const roadmapSubgoalSchema =
  new mongoose.Schema<IRoadmapSubgoalDocument>({
    title: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 500,
    },
    duration: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 10,
    },
    resources: {
      type: [String],
      required: true,
    },
  });

const RoadmapSubgoal = mongoose.model<IRoadmapSubgoalDocument>(
  "RoadmapSubgoal",
  roadmapSubgoalSchema
);
export default RoadmapSubgoal;
