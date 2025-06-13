import mongoose from "mongoose";
import RoadmapGoal, { roadmapGoalSchema } from "./roadmap.goal";
import IRoadmap from "../models/roadmap";

type RoadmapDocument = mongoose.Document & IRoadmap;

export const roadmapSchema = new mongoose.Schema<RoadmapDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 100,
  },
  goals: {
    type: [roadmapGoalSchema],
    required: true,
  },

  status: new mongoose.Schema({
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  }),
});

const Roadmap = mongoose.model<RoadmapDocument>("Roadmap", roadmapSchema);
export default Roadmap;
