import mongoose from "mongoose";
import IRoadmapSubgoal from "../models/roadmap.subgoal";

type RoadmapSubgoalDocument = mongoose.Document & IRoadmapSubgoal;
type RoadmapSubgoalStatusDocument = mongoose.Document & {
  completed: boolean;
  completedAt: Date | null;
};

const roadmapSubgoalSchema = new mongoose.Schema<RoadmapSubgoalDocument>({
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
  status: {
    type: new mongoose.Schema<RoadmapSubgoalStatusDocument>({
      completed: {
        type: Boolean,
        default: false,
        required: true,
      },
      completedAt: {
        type: Date,
        default: null,
        required: true,
      },
    }),
    default: { completed: false, completedAt: null },
    required: true,
  },
});

export default roadmapSubgoalSchema;
